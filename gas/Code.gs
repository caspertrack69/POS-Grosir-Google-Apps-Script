/**
 * GrosirKit - Google Apps Script backend template.
 *
 * Script Properties yang wajib disiapkan:
 * - SPREADSHEET_ID : ID Google Sheet utama
 * - API_TOKEN      : token autentikasi request frontend
 * - INVOICE_FOLDER_ID (opsional) : folder Drive untuk invoice PDF
 * - FONNTE_TOKEN (opsional)      : token API WhatsApp Fonnte
 */

var SHEET_SCHEMAS = {
  Produk: ["id_produk", "nama_produk", "kategori", "harga_dasar", "stok", "stok_minimum", "aktif"],
  Mitra: ["id_mitra", "nama", "nomor_hp", "alamat", "level_tier", "total_pembelian", "tanggal_daftar"],
  Tier_Config: ["level", "nama_tier", "min_transaksi", "diskon_persen"],
  Transaksi: [
    "id_transaksi",
    "id_mitra",
    "tanggal",
    "total_sebelum_diskon",
    "diskon_tier",
    "grand_total",
    "metode_bayar",
    "status",
    "id_invoice",
    "detail_items",
  ],
  Invoice: ["id_invoice", "id_transaksi", "drive_url", "tanggal_buat", "status_wa", "status"],
  Log_WA: ["timestamp", "id_invoice", "nomor_hp", "status", "response"],
};

function doGet(e) {
  return handleRequest_("GET", e);
}

function doPost(e) {
  return handleRequest_("POST", e);
}

function handleRequest_(method, e) {
  try {
    ensureSchema_();

    var payload = method === "POST" ? parsePostBody_(e) : {};
    var action = getAction_(method, e, payload);

    validateToken_(e, payload);

    if (!action) {
      return jsonOutput_({ status: "error", message: "Parameter action wajib diisi." });
    }

    if (method === "GET") {
      return jsonOutput_({ status: "success", data: handleGetAction_(action, e) });
    }

    return jsonOutput_({ status: "success", data: handlePostAction_(action, payload) });
  } catch (error) {
    return jsonOutput_({
      status: "error",
      message: error && error.message ? error.message : "Unhandled backend error",
    });
  }
}

function handleGetAction_(action, e) {
  var params = (e && e.parameter) || {};

  switch (action) {
    case "getProduk":
      return getProduk_();
    case "getMitra":
      return getMitraById_(params.id);
    case "getMitraList":
      return getMitraList_();
    case "getTierConfig":
      return getTierConfig_();
    case "getDashboard":
      return getDashboard_();
    case "getInvoice":
      return getInvoiceById_(params.id);
    default:
      throw new Error("Action GET tidak dikenal: " + action);
  }
}

function handlePostAction_(action, payload) {
  switch (action) {
    case "createTransaksi":
      return createTransaksi_(payload);
    case "updateStatusInvoice":
      return updateStatusInvoice_(payload);
    case "addProduk":
      return addProduk_(payload);
    case "addMitra":
      return addMitra_(payload);
    default:
      throw new Error("Action POST tidak dikenal: " + action);
  }
}

function validateToken_(e, payload) {
  var scriptToken = getScriptProperty_("API_TOKEN");

  if (!scriptToken) {
    throw new Error("API_TOKEN belum diset di Script Properties.");
  }

  // Google Apps Script web app tidak mengekspos Authorization header,
  // jadi token dikirim lewat query/body sebagai fallback.
  var requestToken =
    ((e && e.parameter && e.parameter.token) || "") ||
    ((payload && payload.token) || "");

  if (!requestToken || requestToken !== scriptToken) {
    throw new Error("Unauthorized request token.");
  }
}

function getAction_(method, e, payload) {
  if (method === "GET") {
    return (e && e.parameter && e.parameter.action) || "";
  }

  return (payload && payload.action) || "";
}

function parsePostBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error("Payload JSON tidak valid.");
  }
}

function ensureSchema_() {
  var spreadsheet = getSpreadsheet_();

  Object.keys(SHEET_SCHEMAS).forEach(function (sheetName) {
    var sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }

    var currentHeaders = getHeaders_(sheet);

    if (currentHeaders.length === 0) {
      sheet.getRange(1, 1, 1, SHEET_SCHEMAS[sheetName].length).setValues([SHEET_SCHEMAS[sheetName]]);
    }
  });

  ensureDefaultTierConfig_();
  ensureDefaultMitra_();
}

function ensureDefaultTierConfig_() {
  var rows = getRows_("Tier_Config");

  if (rows.length > 0) {
    return;
  }

  var defaults = [
    { level: 1, nama_tier: "Pembeli Umum", min_transaksi: 0, diskon_persen: 0 },
    { level: 2, nama_tier: "Mitra Perak", min_transaksi: 500000, diskon_persen: 5 },
    { level: 3, nama_tier: "Mitra Emas", min_transaksi: 2000000, diskon_persen: 10 },
    { level: 4, nama_tier: "Mitra Platinum", min_transaksi: 5000000, diskon_persen: 15 },
  ];

  defaults.forEach(function (item) {
    appendRow_("Tier_Config", item);
  });
}

function ensureDefaultMitra_() {
  var rows = getRows_("Mitra");
  var existing = rows.some(function (row) {
    return String(row.id_mitra) === "MTR-000";
  });

  if (existing) {
    return;
  }

  appendRow_("Mitra", {
    id_mitra: "MTR-000",
    nama: "Pembeli Umum",
    nomor_hp: "",
    alamat: "-",
    level_tier: 1,
    total_pembelian: 0,
    tanggal_daftar: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
  });
}

function getProduk_() {
  return getRows_("Produk").filter(function (row) {
    return String(row.aktif || "TRUE").toUpperCase() !== "FALSE";
  });
}

function getMitraList_() {
  var rows = getRows_("Mitra");

  if (rows.length === 0) {
    return [
      {
        id_mitra: "MTR-000",
        nama: "Pembeli Umum",
        nomor_hp: "-",
        alamat: "-",
        level_tier: 1,
        total_pembelian: 0,
        tanggal_daftar: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
      },
    ];
  }

  return rows;
}

function getMitraById_(idMitra) {
  if (!idMitra) {
    throw new Error("Parameter id mitra wajib diisi.");
  }

  var mitra = findById_("Mitra", "id_mitra", idMitra);

  if (!mitra) {
    throw new Error("Mitra tidak ditemukan: " + idMitra);
  }

  var tier = getTierByLevel_(toNumber_(mitra.level_tier));

  return {
    mitra: mitra,
    tier: tier,
  };
}

function getTierConfig_() {
  return getRows_("Tier_Config").sort(function (a, b) {
    return toNumber_(a.level) - toNumber_(b.level);
  });
}

function getInvoiceById_(idInvoice) {
  if (!idInvoice) {
    throw new Error("Parameter id invoice wajib diisi.");
  }

  var invoice = findById_("Invoice", "id_invoice", idInvoice);

  if (!invoice) {
    throw new Error("Invoice tidak ditemukan: " + idInvoice);
  }

  return invoice;
}

function getDashboard_() {
  var transaksiRows = getRows_("Transaksi");
  var timezone = Session.getScriptTimeZone();
  var now = new Date();
  var today = Utilities.formatDate(now, timezone, "yyyy-MM-dd");

  var omzetHariIni = 0;
  var jumlahTransaksi = 0;
  var mitraSet = {};
  var invoiceBelumBayar = 0;
  var produkCounter = {};

  var omzetMap = {};
  for (var i = 0; i < 7; i++) {
    var date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    var dateKey = Utilities.formatDate(date, timezone, "yyyy-MM-dd");
    omzetMap[dateKey] = 0;
  }

  transaksiRows.forEach(function (row) {
    var rowDate = new Date(row.tanggal || row.created_at || new Date());
    var rowDateKey = Utilities.formatDate(rowDate, timezone, "yyyy-MM-dd");
    var grandTotal = toNumber_(row.grand_total);

    if (rowDateKey === today) {
      omzetHariIni += grandTotal;
      jumlahTransaksi += 1;
      mitraSet[row.id_mitra || "MTR-000"] = true;

      var detailItems = safeJsonParse_(row.detail_items, []);
      detailItems.forEach(function (item) {
        var key = item.nama_produk || item.id_produk || "Produk";
        produkCounter[key] = (produkCounter[key] || 0) + toNumber_(item.qty || 0);
      });
    }

    if ((row.status || "BELUM LUNAS") !== "LUNAS") {
      invoiceBelumBayar += 1;
    }

    if (Object.prototype.hasOwnProperty.call(omzetMap, rowDateKey)) {
      omzetMap[rowDateKey] += grandTotal;
    }
  });

  var produkTerlaris = "-";
  var maxQty = -1;
  Object.keys(produkCounter).forEach(function (name) {
    if (produkCounter[name] > maxQty) {
      maxQty = produkCounter[name];
      produkTerlaris = name;
    }
  });

  var omzet7Hari = Object.keys(omzetMap)
    .sort()
    .map(function (dateKey) {
      return {
        tanggal: dateKey,
        omzet: omzetMap[dateKey],
      };
    });

  return {
    omzet_hari_ini: omzetHariIni,
    jumlah_transaksi: jumlahTransaksi,
    mitra_aktif: Object.keys(mitraSet).length,
    produk_terlaris: produkTerlaris,
    invoice_belum_bayar: invoiceBelumBayar,
    omzet_7_hari: omzet7Hari,
  };
}

function createTransaksi_(payload) {
  validateRequired_(payload, ["id_mitra", "items", "metode_bayar", "status"]);

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error("Minimal 1 item transaksi dibutuhkan.");
  }

  var mitra = findById_("Mitra", "id_mitra", payload.id_mitra) || {
    id_mitra: "MTR-000",
    nama: "Pembeli Umum",
    nomor_hp: "",
    level_tier: 1,
    total_pembelian: 0,
  };

  var tier = getTierByLevel_(toNumber_(mitra.level_tier || 1));
  var detailItems = [];
  var totalSebelumDiskon = 0;
  var totalDiskon = 0;

  payload.items.forEach(function (item) {
    var product = findById_("Produk", "id_produk", item.id_produk);

    if (!product) {
      throw new Error("Produk tidak ditemukan: " + item.id_produk);
    }

    var qty = Math.max(1, Math.floor(toNumber_(item.qty)));
    var unitPrice = toNumber_(product.harga_dasar);
    var lineTotal = unitPrice * qty;
    var discountValue = calculateDiscount_(lineTotal, toNumber_(tier.diskon_persen));
    var subtotal = lineTotal - discountValue;

    totalSebelumDiskon += lineTotal;
    totalDiskon += discountValue;

    detailItems.push({
      id_produk: product.id_produk,
      nama_produk: product.nama_produk,
      qty: qty,
      harga_dasar: unitPrice,
      diskon_persen: toNumber_(tier.diskon_persen),
      subtotal: subtotal,
    });

    var currentStock = toNumber_(product.stok);
    var nextStock = Math.max(0, currentStock - qty);
    updateRowById_("Produk", "id_produk", product.id_produk, { stok: nextStock });
  });

  var grandTotal = totalSebelumDiskon - totalDiskon;
  var idTransaksi = generateDocumentId_("TRX", getSheetRowCount_("Transaksi"));
  var idInvoice = generateDocumentId_("INV", getSheetRowCount_("Invoice"));
  var nowIso = new Date().toISOString();

  appendRow_("Transaksi", {
    id_transaksi: idTransaksi,
    id_mitra: mitra.id_mitra,
    tanggal: nowIso,
    total_sebelum_diskon: totalSebelumDiskon,
    diskon_tier: totalDiskon,
    grand_total: grandTotal,
    metode_bayar: payload.metode_bayar,
    status: payload.status,
    id_invoice: idInvoice,
    detail_items: JSON.stringify(detailItems),
  });

  var invoiceResult = generateInvoicePdf_({
    id_invoice: idInvoice,
    id_transaksi: idTransaksi,
    id_mitra: mitra.id_mitra,
    nomor_hp: mitra.nomor_hp,
    nama_mitra: mitra.nama,
    alamat: mitra.alamat,
    level_tier: mitra.level_tier,
    diskon_persen: tier.diskon_persen,
    items: detailItems,
    total_sebelum_diskon: totalSebelumDiskon,
    diskon_tier: totalDiskon,
    grand_total: grandTotal,
    status: payload.status,
  });

  appendRow_("Invoice", {
    id_invoice: idInvoice,
    id_transaksi: idTransaksi,
    drive_url: invoiceResult.drive_url,
    tanggal_buat: nowIso,
    status_wa: invoiceResult.wa_status,
    status: payload.status,
  });

  var updatedTotalPembelian = toNumber_(mitra.total_pembelian) + grandTotal;
  updateRowById_("Mitra", "id_mitra", mitra.id_mitra, {
    total_pembelian: updatedTotalPembelian,
  });

  maybeUpgradeTier_(mitra.id_mitra, updatedTotalPembelian);

  return {
    id_transaksi: idTransaksi,
    id_invoice: idInvoice,
    grand_total: grandTotal,
    drive_url: invoiceResult.drive_url,
    wa_status: invoiceResult.wa_status,
    status_wa: invoiceResult.wa_status,
  };
}

function updateStatusInvoice_(payload) {
  validateRequired_(payload, ["id_invoice", "status"]);

  var invoice = findById_("Invoice", "id_invoice", payload.id_invoice);
  if (!invoice) {
    throw new Error("Invoice tidak ditemukan: " + payload.id_invoice);
  }

  updateRowById_("Invoice", "id_invoice", payload.id_invoice, {
    status: payload.status,
  });

  if (invoice.id_transaksi) {
    updateRowById_("Transaksi", "id_transaksi", invoice.id_transaksi, {
      status: payload.status,
    });
  }

  return {
    id_invoice: payload.id_invoice,
    status: payload.status,
  };
}

function addProduk_(payload) {
  validateRequired_(payload, ["id_produk", "nama_produk", "harga_dasar"]);

  if (findById_("Produk", "id_produk", payload.id_produk)) {
    throw new Error("id_produk sudah dipakai: " + payload.id_produk);
  }

  var product = {
    id_produk: payload.id_produk,
    nama_produk: payload.nama_produk,
    kategori: payload.kategori || "",
    harga_dasar: toNumber_(payload.harga_dasar),
    stok: toNumber_(payload.stok),
    stok_minimum: toNumber_(payload.stok_minimum),
    aktif: payload.aktif === false ? "FALSE" : "TRUE",
  };

  appendRow_("Produk", product);

  return product;
}

function addMitra_(payload) {
  validateRequired_(payload, ["id_mitra", "nama", "nomor_hp"]);

  if (findById_("Mitra", "id_mitra", payload.id_mitra)) {
    throw new Error("id_mitra sudah dipakai: " + payload.id_mitra);
  }

  var mitra = {
    id_mitra: payload.id_mitra,
    nama: payload.nama,
    nomor_hp: payload.nomor_hp,
    alamat: payload.alamat || "",
    level_tier: toNumber_(payload.level_tier || 1),
    total_pembelian: toNumber_(payload.total_pembelian || 0),
    tanggal_daftar:
      payload.tanggal_daftar || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
  };

  appendRow_("Mitra", mitra);

  return mitra;
}

function generateInvoicePdf_(invoiceData) {
  var html = renderInvoiceHtml_(invoiceData);
  var pdfBlob = Utilities.newBlob(html, MimeType.HTML, invoiceData.id_invoice + ".html").getAs(MimeType.PDF);
  var folder = getInvoiceFolder_();
  var file = folder.createFile(pdfBlob).setName(invoiceData.id_invoice + ".pdf");

  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var waResult = sendWhatsAppInvoice_(invoiceData, file.getUrl());

  return {
    drive_url: file.getUrl(),
    wa_status: waResult.status,
  };
}

function renderInvoiceHtml_(invoiceData) {
  var itemRows = invoiceData.items
    .map(function (item) {
      return (
        "<tr>" +
        "<td>" + sanitize_(item.nama_produk) + "</td>" +
        "<td style='text-align:right;'>" + item.qty + "</td>" +
        "<td style='text-align:right;'>" + item.harga_dasar + "</td>" +
        "<td style='text-align:right;'>" + item.subtotal + "</td>" +
        "</tr>"
      );
    })
    .join("");

  return (
    "<html><body style='font-family:Arial,sans-serif;'>" +
    "<h2>Invoice " + sanitize_(invoiceData.id_invoice) + "</h2>" +
    "<p><strong>Mitra:</strong> " + sanitize_(invoiceData.nama_mitra || "-") + "</p>" +
    "<p><strong>Level Tier:</strong> " + sanitize_(String(invoiceData.level_tier || 1)) + "</p>" +
    "<table style='width:100%;border-collapse:collapse;' border='1' cellpadding='6'>" +
    "<thead><tr><th>Produk</th><th>Qty</th><th>Harga Dasar</th><th>Subtotal</th></tr></thead>" +
    "<tbody>" +
    itemRows +
    "</tbody></table>" +
    "<p><strong>Total Sebelum Diskon:</strong> " + invoiceData.total_sebelum_diskon + "</p>" +
    "<p><strong>Diskon Tier:</strong> " + invoiceData.diskon_tier + "</p>" +
    "<p><strong>Grand Total:</strong> " + invoiceData.grand_total + "</p>" +
    "<p><strong>Status:</strong> " + sanitize_(invoiceData.status || "BELUM LUNAS") + "</p>" +
    "</body></html>"
  );
}

function sendWhatsAppInvoice_(invoiceData, driveUrl) {
  var token = getScriptProperty_("FONNTE_TOKEN");

  if (!token) {
    appendRow_("Log_WA", {
      timestamp: new Date().toISOString(),
      id_invoice: invoiceData.id_invoice,
      nomor_hp: "",
      status: "PENDING",
      response: "FONNTE_TOKEN belum diset",
    });

    return { status: "PENDING" };
  }

  var mitra = findById_("Mitra", "id_mitra", invoiceData.id_mitra) || {};
  var nomorHp = invoiceData.nomor_hp || mitra.nomor_hp || "";

  if (!nomorHp) {
    appendRow_("Log_WA", {
      timestamp: new Date().toISOString(),
      id_invoice: invoiceData.id_invoice,
      nomor_hp: nomorHp,
      status: "GAGAL",
      response: "Nomor HP mitra kosong",
    });

    return { status: "GAGAL" };
  }

  var message =
    "Halo " +
    (invoiceData.nama_mitra || "Mitra") +
    ", invoice " +
    invoiceData.id_invoice +
    " total Rp" +
    invoiceData.grand_total +
    " sudah tersedia: " +
    driveUrl;

  try {
    var response = UrlFetchApp.fetch("https://api.fonnte.com/send", {
      method: "post",
      muteHttpExceptions: true,
      headers: {
        Authorization: token,
      },
      payload: {
        target: nomorHp,
        message: message,
      },
    });

    var text = response.getContentText();
    var status = response.getResponseCode() >= 200 && response.getResponseCode() < 300 ? "TERKIRIM" : "GAGAL";

    appendRow_("Log_WA", {
      timestamp: new Date().toISOString(),
      id_invoice: invoiceData.id_invoice,
      nomor_hp: nomorHp,
      status: status,
      response: text,
    });

    return { status: status };
  } catch (error) {
    appendRow_("Log_WA", {
      timestamp: new Date().toISOString(),
      id_invoice: invoiceData.id_invoice,
      nomor_hp: nomorHp,
      status: "GAGAL",
      response: error.message,
    });

    return { status: "GAGAL" };
  }
}

function maybeUpgradeTier_(idMitra, totalPembelian) {
  var mitra = findById_("Mitra", "id_mitra", idMitra);
  if (!mitra) {
    return;
  }

  var tiers = getTierConfig_().sort(function (a, b) {
    return toNumber_(a.min_transaksi) - toNumber_(b.min_transaksi);
  });

  var targetLevel = toNumber_(mitra.level_tier || 1);

  tiers.forEach(function (tier) {
    if (totalPembelian >= toNumber_(tier.min_transaksi)) {
      targetLevel = Math.max(targetLevel, toNumber_(tier.level));
    }
  });

  if (targetLevel !== toNumber_(mitra.level_tier || 1)) {
    updateRowById_("Mitra", "id_mitra", idMitra, {
      level_tier: targetLevel,
    });
  }
}

function getTierByLevel_(level) {
  var tier = findById_("Tier_Config", "level", level);

  if (!tier) {
    return {
      level: 1,
      nama_tier: "Pembeli Umum",
      min_transaksi: 0,
      diskon_persen: 0,
    };
  }

  return tier;
}

function calculateDiscount_(amount, percent) {
  var basisPoints = Math.round(percent * 100);
  var raw = amount * basisPoints;
  return Math.round(raw / 10000);
}

function getSpreadsheet_() {
  var spreadsheetId = getScriptProperty_("SPREADSHEET_ID");
  if (!spreadsheetId) {
    throw new Error("SPREADSHEET_ID belum diset di Script Properties.");
  }

  return SpreadsheetApp.openById(spreadsheetId);
}

function getScriptProperty_(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

function getSheet_(sheetName) {
  var sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) {
    throw new Error("Sheet tidak ditemukan: " + sheetName);
  }

  return sheet;
}

function getHeaders_(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    return [];
  }

  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function (value) {
    return String(value || "").trim();
  });
}

function getRows_(sheetName) {
  var sheet = getSheet_(sheetName);
  var headers = getHeaders_(sheet);

  if (headers.length === 0 || sheet.getLastRow() <= 1) {
    return [];
  }

  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();

  return values.map(function (row) {
    var object = {};

    headers.forEach(function (header, index) {
      object[header] = row[index];
    });

    return object;
  });
}

function appendRow_(sheetName, dataObject) {
  var sheet = getSheet_(sheetName);
  var headers = SHEET_SCHEMAS[sheetName];

  var row = headers.map(function (header) {
    return Object.prototype.hasOwnProperty.call(dataObject, header) ? dataObject[header] : "";
  });

  sheet.appendRow(row);
}

function findById_(sheetName, key, value) {
  var rows = getRows_(sheetName);
  var target = String(value);

  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][key]) === target) {
      return rows[i];
    }
  }

  return null;
}

function updateRowById_(sheetName, key, value, updates) {
  var sheet = getSheet_(sheetName);
  var headers = SHEET_SCHEMAS[sheetName];

  if (sheet.getLastRow() <= 1) {
    return false;
  }

  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();

  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][headers.indexOf(key)]) === String(value)) {
      Object.keys(updates).forEach(function (field) {
        var headerIndex = headers.indexOf(field);
        if (headerIndex >= 0) {
          rows[i][headerIndex] = updates[field];
        }
      });

      sheet.getRange(i + 2, 1, 1, headers.length).setValues([rows[i]]);
      return true;
    }
  }

  return false;
}

function getSheetRowCount_(sheetName) {
  var sheet = getSheet_(sheetName);
  return Math.max(0, sheet.getLastRow() - 1);
}

function validateRequired_(payload, requiredFields) {
  requiredFields.forEach(function (field) {
    var value = payload[field];
    if (value === undefined || value === null || value === "") {
      throw new Error("Field wajib belum diisi: " + field);
    }
  });
}

function generateDocumentId_(prefix, currentCount) {
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd");
  var sequence = String(currentCount + 1).padStart(4, "0");
  return prefix + "-" + today + "-" + sequence;
}

function getInvoiceFolder_() {
  var folderId = getScriptProperty_("INVOICE_FOLDER_ID");

  if (folderId) {
    return DriveApp.getFolderById(folderId);
  }

  return DriveApp.getRootFolder();
}

function toNumber_(value) {
  var parsed = Number(value || 0);
  return isNaN(parsed) ? 0 : parsed;
}

function safeJsonParse_(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function sanitize_(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function jsonOutput_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
