// API_URL và formatDateTime được khai báo sẵn trong đề/bộ khung thực hành.
const API_URL = "http://localhost:4000/api/events";

const formatDateTime = (iso) => {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
};

// a) Trả về tình trạng chỗ còn lại của sự kiện.
const formatSeats = (event) => {
  const remaining = Math.max(0, Number(event.capacity) - Number(event.registeredCount));
  return remaining === 0
    ? "Hết chỗ"
    : `Còn ${remaining}/${event.capacity} chỗ`;
};

// b) Tạo các thẻ sự kiện bằng DOM API, không dùng innerHTML.
const renderEvents = (events) => {
  const eventList = document.querySelector("#event-list");
  const fragment = document.createDocumentFragment();

  if (!Array.isArray(events) || events.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Không có sự kiện nào để hiển thị.";
    fragment.appendChild(empty);
    eventList.replaceChildren(fragment);
    return;
  }

  events.forEach((event) => {
    const article = document.createElement("article");
    article.className = "event-card";

    const image = document.createElement("img");
    image.setAttribute("src", "img/event.svg");
    image.setAttribute("alt", `Hình minh họa ${event.name || "sự kiện"}`);

    const content = document.createElement("div");
    content.className = "event-content";

    const category = document.createElement("span");
    category.className = "event-category";
    category.textContent = "EDUHUB EVENT";

    const heading = document.createElement("h2");
    const link = document.createElement("a");
    link.setAttribute("href", `event-detail.html?id=${encodeURIComponent(event.id ?? "")}`);
    link.textContent = event.name ?? "Sự kiện chưa có tên";
    heading.appendChild(link);

    const dateRow = document.createElement("p");
    dateRow.className = "event-meta";
    const time = document.createElement("time");
    if (event.startTime) {
      time.setAttribute("datetime", event.startTime);
      time.textContent = formatDateTime(event.startTime);
    } else {
      time.textContent = "Chưa cập nhật thời gian";
    }
    dateRow.append("◷ ", time);

    const locationRow = document.createElement("p");
    locationRow.className = "event-meta";
    locationRow.textContent = `⌖ ${event.location ?? "Chưa cập nhật địa điểm"}`;

    const seats = document.createElement("p");
    seats.className = "seat-count";
    seats.textContent = formatSeats(event);
    if (seats.textContent === "Hết chỗ") {
      seats.classList.add("is-full");
    }

    content.append(category, heading, dateRow, locationRow, seats);
    article.append(image, content);
    fragment.appendChild(article);
  });

  eventList.replaceChildren(fragment);
};

// c) Gọi API, xử lý trạng thái tải, dữ liệu rỗng và lỗi.
const loadEvents = async (keyword = "") => {
  const status = document.querySelector("#status");
  const eventList = document.querySelector("#event-list");
  status.textContent = "Đang tải…";

  const params = new URLSearchParams();
  params.set("pageSize", "50");
  const trimmedKeyword = keyword.trim();
  if (trimmedKeyword !== "") {
    params.set("q", trimmedKeyword);
  }

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const events = Array.isArray(data.items) ? data.items : [];
    renderEvents(events);

    if (events.length > 0) {
      status.textContent = `Tìm thấy ${data.totalCount ?? events.length} sự kiện`;
    } else {
      status.textContent = "Không có sự kiện nào khớp từ khoá.";
    }
  } catch (error) {
    console.error("Không thể tải danh sách sự kiện:", error);
    eventList.replaceChildren();
    status.textContent = "Không tải được dữ liệu, vui lòng thử lại.";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.querySelector("#search-form");
  const keywordInput = document.querySelector("#keyword");

  loadEvents();

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loadEvents(keywordInput.value.trim());
  });
});
