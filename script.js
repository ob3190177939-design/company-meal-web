const STORAGE_KEY = "xinhua-company-meal-records-v2";

const optionSets = {
  mealPeriods: ["早餐", "午餐", "下午茶", "晚餐", "夜宵"],
  stores: ["绿众商业中心店", "文耀大厦店", "银泰店", "总部", "其他门店"],
  companies: ["雷迪森", "古越缘庄园", "花边园炒饭", "花边M2M楼", "网鱼电竞酒店", "临时客户"],
  mealCounts: Array.from({ length: 60 }, (_, index) => String(index + 1)),
  mealPrices: ["18", "20", "23", "25", "28", "30", "35", "40"],
  paymentMethods: [
    "小程序（王海啸）",
    "企业微信（王海啸）",
    "章梦春对公账户（章梦春）",
    "章梦春微信（章梦春）",
    "门店对公账户",
  ],
  deliveryMethods: ["无配送", "自提", "闪送", "货拉拉", "跑腿", "骑手配送"],
  deliveryFees: ["0", "5", "7.5", "10", "12.9", "16.42", "17.02", "20", "28", "30.1", "52.8"],
  approvalStatuses: ["待确认", "已确认", "已对账"],
  operators: ["王海啸", "章梦春", "店长", "值班经理"],
  quickRemarks: ["午餐", "晚餐", "临时加单", "客户到付", "含配送费", "堂食自提", "已核对", "月结客户"],
  dispatchNotes: ["正常配送", "骑手已接单", "客户自提", "配送中", "已送达", "无需配送"],
};

const state = {
  records: loadRecords(),
  editingId: null,
  selectedRemarks: [],
  selectedDispatch: "",
};

const form = document.getElementById("mealForm");
const mealDate = document.getElementById("mealDate");
const mealPeriod = document.getElementById("mealPeriod");
const storeName = document.getElementById("storeName");
const companyName = document.getElementById("companyName");
const mealCount = document.getElementById("mealCount");
const mealPrice = document.getElementById("mealPrice");
const mealAmount = document.getElementById("mealAmount");
const paymentMethod = document.getElementById("paymentMethod");
const deliveryMethod = document.getElementById("deliveryMethod");
const deliveryFee = document.getElementById("deliveryFee");
const approvalStatus = document.getElementById("approvalStatus");
const operatorName = document.getElementById("operatorName");
const remarkChips = document.getElementById("remarkChips");
const dispatchChips = document.getElementById("dispatchChips");
const summaryTotal = document.getElementById("summaryTotal");
const summaryText = document.getElementById("summaryText");
const resetBtn = document.getElementById("resetBtn");
const saveCurrentBtn = document.getElementById("saveCurrentBtn");
const saveBoardBtn = document.getElementById("saveBoardBtn");
const saveTodayBtn = document.getElementById("saveTodayBtn");
const exportBtn = document.getElementById("exportBtn");
const clearBtn = document.getElementById("clearBtn");
const editingHint = document.getElementById("editingHint");
const recordList = document.getElementById("recordList");
const recordTemplate = document.getElementById("recordCardTemplate");
const recordCountLabel = document.getElementById("recordCountLabel");
const statOrders = document.getElementById("statOrders");
const statMeals = document.getElementById("statMeals");
const statFood = document.getElementById("statFood");
const statDelivery = document.getElementById("statDelivery");
const filterDate = document.getElementById("filterDate");
const filterStore = document.getElementById("filterStore");
const captureBoard = document.getElementById("captureBoard");

const captureNodes = {
  title: document.getElementById("captureTitle"),
  date: document.getElementById("captureDate"),
  store: document.getElementById("captureStore"),
  period: document.getElementById("capturePeriod"),
  company: document.getElementById("captureCompany"),
  count: document.getElementById("captureCount"),
  price: document.getElementById("capturePrice"),
  amount: document.getElementById("captureAmount"),
  delivery: document.getElementById("captureDelivery"),
  payment: document.getElementById("capturePayment"),
  dispatch: document.getElementById("captureDispatch"),
  approval: document.getElementById("captureApproval"),
  operator: document.getElementById("captureOperator"),
  tags: document.getElementById("captureTags"),
  total: document.getElementById("captureTotal"),
  note: document.getElementById("captureNote"),
};

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.records));
}

function setSelectOptions(select, values, placeholder) {
  select.innerHTML = "";

  if (placeholder) {
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = placeholder;
    select.appendChild(empty);
  }

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function setToday() {
  const today = new Date().toISOString().slice(0, 10);
  mealDate.value = today;
  filterDate.value = today;
}

function renderChipGroup(root, values, mode) {
  root.innerHTML = "";

  values.forEach((value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = value;
    button.className = "chip-option";

    if (mode === "remarks" && state.selectedRemarks.includes(value)) {
      button.classList.add("active");
    }

    if (mode === "dispatch" && state.selectedDispatch === value) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      if (mode === "remarks") {
        state.selectedRemarks = state.selectedRemarks.includes(value)
          ? state.selectedRemarks.filter((item) => item !== value)
          : [...state.selectedRemarks, value];
      }

      if (mode === "dispatch") {
        state.selectedDispatch = state.selectedDispatch === value ? "" : value;
      }

      renderChipGroup(root, values, mode);
    });

    root.appendChild(button);
  });
}

function calculateAmounts() {
  const count = Number(mealCount.value || 0);
  const price = Number(mealPrice.value || 0);
  const fee = Number(deliveryFee.value || 0);
  const amount = count * price;
  const total = amount + fee;

  mealAmount.value = amount.toFixed(2);
  summaryTotal.textContent = `总支出 ${total.toFixed(2)}`;
  summaryText.textContent = amount
    ? `本次餐费 ${amount.toFixed(2)} 元，配送费 ${fee.toFixed(2)} 元。`
    : "请选择数量、单价和配送金额，系统会自动算出本次总支出。";
}

function getFormRecord() {
  const count = Number(mealCount.value || 0);
  const price = Number(mealPrice.value || 0);
  const fee = Number(deliveryFee.value || 0);
  const amount = count * price;

  return {
    id: state.editingId || crypto.randomUUID(),
    mealDate: mealDate.value,
    mealPeriod: mealPeriod.value,
    storeName: storeName.value,
    companyName: companyName.value,
    mealCount: count,
    mealPrice: price,
    mealAmount: amount,
    paymentMethod: paymentMethod.value,
    deliveryMethod: deliveryMethod.value,
    deliveryFee: fee,
    approvalStatus: approvalStatus.value,
    operatorName: operatorName.value,
    remarks: [...state.selectedRemarks],
    dispatchNote: state.selectedDispatch,
    totalCost: amount + fee,
    updatedAt: new Date().toISOString(),
  };
}

function resetForm(keepDate = true) {
  form.reset();
  state.editingId = null;
  state.selectedRemarks = [];
  state.selectedDispatch = "";
  renderChipGroup(remarkChips, optionSets.quickRemarks, "remarks");
  renderChipGroup(dispatchChips, optionSets.dispatchNotes, "dispatch");
  editingHint.textContent = "新增模式";

  if (keepDate) {
    mealDate.value = filterDate.value || new Date().toISOString().slice(0, 10);
  }

  mealPeriod.value = optionSets.mealPeriods[1];
  storeName.value = optionSets.stores[0];
  companyName.value = optionSets.companies[0];
  mealCount.value = optionSets.mealCounts[0];
  mealPrice.value = optionSets.mealPrices[3];
  paymentMethod.value = optionSets.paymentMethods[0];
  deliveryMethod.value = optionSets.deliveryMethods[0];
  deliveryFee.value = optionSets.deliveryFees[0];
  approvalStatus.value = optionSets.approvalStatuses[0];
  operatorName.value = optionSets.operators[0];
  calculateAmounts();
}

function renderStats(records) {
  const orders = records.length;
  const meals = records.reduce((sum, record) => sum + Number(record.mealCount || 0), 0);
  const food = records.reduce((sum, record) => sum + Number(record.mealAmount || 0), 0);
  const delivery = records.reduce((sum, record) => sum + Number(record.deliveryFee || 0), 0);

  statOrders.textContent = String(orders);
  statMeals.textContent = String(meals);
  statFood.textContent = food.toFixed(2);
  statDelivery.textContent = delivery.toFixed(2);
}

function buildMetaItem(label, value) {
  const fragment = document.createDocumentFragment();
  const dt = document.createElement("dt");
  dt.textContent = label;
  const dd = document.createElement("dd");
  dd.textContent = value;
  fragment.append(dt, dd);
  return fragment;
}

function renderRecords() {
  const selectedDate = filterDate.value;
  const selectedStore = filterStore.value;

  const visibleRecords = state.records
    .filter((record) => !selectedDate || record.mealDate === selectedDate)
    .filter((record) => !selectedStore || record.storeName === selectedStore)
    .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));

  recordList.innerHTML = "";
  recordCountLabel.textContent = `${visibleRecords.length} 条`;
  renderStats(visibleRecords);

  if (!visibleRecords.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
      <strong>还没有符合条件的记录</strong>
      <p>先在左侧保存一条登记，或者切换一下日期和门店筛选。</p>
    `;
    recordList.appendChild(empty);
    return;
  }

  visibleRecords.forEach((record) => {
    const node = recordTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".record-date").textContent = `${record.mealDate} · ${record.storeName}`;
    node.querySelector(".record-company").textContent = record.companyName;
    node.querySelector(".record-period").textContent = record.mealPeriod;

    node.querySelector(".record-metrics").innerHTML = `
      <div><span>数量</span><strong>${record.mealCount}</strong></div>
      <div><span>单价</span><strong>${Number(record.mealPrice).toFixed(2)}</strong></div>
      <div><span>餐费</span><strong>${Number(record.mealAmount).toFixed(2)}</strong></div>
      <div><span>总支出</span><strong>${Number(record.totalCost).toFixed(2)}</strong></div>
    `;

    const meta = node.querySelector(".record-meta");
    meta.append(
      buildMetaItem("付款方式", record.paymentMethod),
      buildMetaItem("配送方式", `${record.deliveryMethod} / ${Number(record.deliveryFee).toFixed(2)}`),
      buildMetaItem("门店确认", record.approvalStatus),
      buildMetaItem("操作人", record.operatorName),
    );

    const tags = node.querySelector(".record-tags");
    [...record.remarks, ...(record.dispatchNote ? [record.dispatchNote] : [])].forEach((tag) => {
      const span = document.createElement("span");
      span.className = "tag-pill";
      span.textContent = tag;
      tags.appendChild(span);
    });

    node.querySelector(".screenshot").addEventListener("click", () => saveRecordScreenshot(record));
    node.querySelector(".edit").addEventListener("click", () => startEdit(record.id));
    node.querySelector(".duplicate").addEventListener("click", () => duplicateRecord(record.id));
    node.querySelector(".danger").addEventListener("click", () => deleteRecord(record.id));

    recordList.appendChild(node);
  });
}

function startEdit(recordId) {
  const record = state.records.find((item) => item.id === recordId);
  if (!record) return;

  state.editingId = record.id;
  editingHint.textContent = "编辑模式";
  mealDate.value = record.mealDate;
  mealPeriod.value = record.mealPeriod;
  storeName.value = record.storeName;
  companyName.value = record.companyName;
  mealCount.value = String(record.mealCount);
  mealPrice.value = String(record.mealPrice);
  paymentMethod.value = record.paymentMethod;
  deliveryMethod.value = record.deliveryMethod;
  deliveryFee.value = String(record.deliveryFee);
  approvalStatus.value = record.approvalStatus;
  operatorName.value = record.operatorName;
  state.selectedRemarks = [...record.remarks];
  state.selectedDispatch = record.dispatchNote;
  renderChipGroup(remarkChips, optionSets.quickRemarks, "remarks");
  renderChipGroup(dispatchChips, optionSets.dispatchNotes, "dispatch");
  calculateAmounts();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function duplicateRecord(recordId) {
  const record = state.records.find((item) => item.id === recordId);
  if (!record) return;

  state.records.unshift({
    ...record,
    id: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  });
  saveRecords();
  renderRecords();
}

function deleteRecord(recordId) {
  const record = state.records.find((item) => item.id === recordId);
  if (!record) return;

  if (!window.confirm(`确定删除 ${record.companyName} 这条登记吗？`)) {
    return;
  }

  state.records = state.records.filter((item) => item.id !== recordId);
  saveRecords();
  renderRecords();
}

function exportCsv() {
  if (!state.records.length) {
    window.alert("还没有可导出的登记记录。");
    return;
  }

  const rows = [
    [
      "送餐日期",
      "时段",
      "门店",
      "送餐单位",
      "数量",
      "单价",
      "餐费金额",
      "付款方式",
      "配送方式",
      "配送金额",
      "门店确认",
      "操作人",
      "常用备注",
      "配送说明",
      "总支出",
    ],
    ...state.records.map((record) => [
      record.mealDate,
      record.mealPeriod,
      record.storeName,
      record.companyName,
      record.mealCount,
      record.mealPrice,
      Number(record.mealAmount).toFixed(2),
      record.paymentMethod,
      record.deliveryMethod,
      Number(record.deliveryFee).toFixed(2),
      record.approvalStatus,
      record.operatorName,
      record.remarks.join("、"),
      record.dispatchNote,
      Number(record.totalCost).toFixed(2),
    ]),
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `公司餐登记_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2);
}

function createCaptureTags(tags) {
  captureNodes.tags.innerHTML = "";

  tags.forEach((tag) => {
    const span = document.createElement("span");
    span.className = "capture-pill";
    span.textContent = tag;
    captureNodes.tags.appendChild(span);
  });
}

function fillCaptureBoard(payload) {
  captureNodes.title.textContent = payload.title;
  captureNodes.date.textContent = payload.mealDate || "-";
  captureNodes.store.textContent = payload.storeName || "-";
  captureNodes.period.textContent = payload.mealPeriod || "-";
  captureNodes.company.textContent = payload.companyName || payload.title;
  captureNodes.count.textContent = String(payload.mealCount ?? 0);
  captureNodes.price.textContent = formatMoney(payload.mealPrice);
  captureNodes.amount.textContent = formatMoney(payload.mealAmount);
  captureNodes.delivery.textContent = formatMoney(payload.deliveryFee);
  captureNodes.payment.textContent = payload.paymentMethod || "-";
  captureNodes.dispatch.textContent = payload.deliveryMethod
    ? `${payload.deliveryMethod}${payload.dispatchNote ? ` / ${payload.dispatchNote}` : ""}`
    : payload.dispatchNote || "-";
  captureNodes.approval.textContent = payload.approvalStatus || "-";
  captureNodes.operator.textContent = payload.operatorName || "-";
  captureNodes.total.textContent = formatMoney(payload.totalCost);
  captureNodes.note.textContent = payload.note || "用于门店留底、微信群同步或财务对账。";
  createCaptureTags(payload.tags || []);
}

async function downloadCapture(fileName) {
  if (typeof window.html2canvas !== "function") {
    window.alert("截图组件还没加载成功，请稍后再试。");
    return;
  }

  const canvas = await window.html2canvas(captureBoard, {
    scale: 2,
    backgroundColor: null,
    useCORS: true,
  });

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = fileName;
  link.click();
}

async function saveRecordScreenshot(record) {
  fillCaptureBoard({
    title: "公司餐登记截图",
    ...record,
    tags: [...record.remarks, ...(record.dispatchNote ? [record.dispatchNote] : [])],
    note: "用于门店留底、微信群同步或财务对账。",
  });

  await downloadCapture(`公司餐登记_${record.mealDate}_${record.companyName}.png`);
}

async function saveCurrentFormScreenshot() {
  const record = getFormRecord();
  fillCaptureBoard({
    title: state.editingId ? "当前编辑登记截图" : "当前未保存登记截图",
    ...record,
    tags: [...record.remarks, ...(record.dispatchNote ? [record.dispatchNote] : [])],
    note: state.editingId ? "这是一条正在编辑的登记截图。" : "这是一条尚未保存的当前登记截图。",
  });

  await downloadCapture(`当前登记_${record.mealDate || "未填写"}.png`);
}

async function saveBoardScreenshot() {
  fillCaptureBoard({
    title: "公司餐今日总览",
    mealDate: filterDate.value || new Date().toISOString().slice(0, 10),
    storeName: filterStore.value || "全部门店",
    mealPeriod: "汇总",
    companyName: "今日登记概览",
    mealCount: Number(statMeals.textContent || 0),
    mealPrice: 0,
    mealAmount: Number(statFood.textContent || 0),
    deliveryFee: Number(statDelivery.textContent || 0),
    paymentMethod: "查看导出记录了解明细",
    deliveryMethod: "汇总视图",
    approvalStatus: `${statOrders.textContent} 条登记`,
    operatorName: "网页自动汇总",
    totalCost: Number(statFood.textContent || 0) + Number(statDelivery.textContent || 0),
    tags: ["今日总览", "门店对账", "可发群留存"],
    note: "这张图来自当前筛选条件下的总览汇总。",
  });

  await downloadCapture(`公司餐总览_${filterDate.value || "全部日期"}.png`);
}

function handleSubmit(event) {
  event.preventDefault();
  const record = getFormRecord();

  if (state.editingId) {
    state.records = state.records.map((item) => (item.id === state.editingId ? record : item));
  } else {
    state.records.unshift(record);
  }

  saveRecords();
  renderRecords();
  resetForm();
}

function populateFilters() {
  setSelectOptions(filterStore, optionSets.stores, "全部门店");
  filterStore.value = "";
}

function wireEvents() {
  [mealCount, mealPrice, deliveryFee].forEach((element) => {
    element.addEventListener("change", calculateAmounts);
  });

  deliveryMethod.addEventListener("change", () => {
    if (deliveryMethod.value === "无配送" || deliveryMethod.value === "自提") {
      deliveryFee.value = "0";
    }
    calculateAmounts();
  });

  form.addEventListener("submit", handleSubmit);
  resetBtn.addEventListener("click", () => resetForm(false));
  saveCurrentBtn.addEventListener("click", saveCurrentFormScreenshot);
  saveBoardBtn.addEventListener("click", saveBoardScreenshot);
  saveTodayBtn.addEventListener("click", saveBoardScreenshot);
  exportBtn.addEventListener("click", exportCsv);
  clearBtn.addEventListener("click", () => {
    if (!window.confirm("确定清空当前浏览器里的所有登记记录吗？")) {
      return;
    }
    state.records = [];
    saveRecords();
    renderRecords();
  });

  filterDate.addEventListener("change", renderRecords);
  filterStore.addEventListener("change", renderRecords);
}

function bootstrap() {
  setSelectOptions(mealPeriod, optionSets.mealPeriods);
  setSelectOptions(storeName, optionSets.stores);
  setSelectOptions(companyName, optionSets.companies);
  setSelectOptions(mealCount, optionSets.mealCounts);
  setSelectOptions(mealPrice, optionSets.mealPrices);
  setSelectOptions(paymentMethod, optionSets.paymentMethods);
  setSelectOptions(deliveryMethod, optionSets.deliveryMethods);
  setSelectOptions(deliveryFee, optionSets.deliveryFees);
  setSelectOptions(approvalStatus, optionSets.approvalStatuses);
  setSelectOptions(operatorName, optionSets.operators);
  populateFilters();
  setToday();
  renderChipGroup(remarkChips, optionSets.quickRemarks, "remarks");
  renderChipGroup(dispatchChips, optionSets.dispatchNotes, "dispatch");
  resetForm();
  renderRecords();
  wireEvents();
}

bootstrap();
