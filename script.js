/* global variables */
let isResize = false;
const sidebar = document.querySelector("#sidebar");
const min = 307;
const max = 460;

const dataTooltip = document.querySelectorAll("[data-toolTip]");
const toolTip = document.querySelector("#toolTip");
const private = document.querySelector(".private");
const tabExist = document.querySelector(".createPage");
const features = document.querySelector(".createPage .features");
const addPage = document.querySelector("#addPage");
const editor = document.querySelector("#editor");
const ctrlSave = document.querySelector("#ctrlSave");
const headEditTitle = document.querySelector("#editor-header-title p");
const editbox = document.querySelector(".editbox");
const editboxInput = document.querySelector(".editbox input");
const editerHeader = document.querySelector("#editor-header");
const editorContent = document.querySelector(".editor-content");
const bannerOption = document.querySelector(".bannerOptions");
const addCoverOptions = document.querySelector(".addCover");
const addIconOptions = document.querySelector(".addIcon");
const basicOption = document.querySelector(".basicOptions");
const headingOne = document.querySelector(".headingOne");
const headingTwo = document.querySelector(".headingTwo");
const headingThree = document.querySelector(".headingThree");
const list = document.querySelector(".list");
const code = document.querySelector(".code");
const checkboxContent = document.querySelector(".checkboxContent");
const searchTab = document.querySelector(".side-options");
const searchBar = document.querySelector(".editor-search-bar");
const searchInput = document.querySelector("#SearchInput");
const searchArea = document.querySelector(".searched-pages");
const pageOptions = document.querySelectorAll(".page-options");
const themeToggle = document.querySelector(".darklightmode");

let pages = JSON.parse(localStorage.getItem("pages")) || [];
let pageObj = null;
let currentBindTitle = null;
let currentTitleElement = null;
let activeBlock = null;
let activeDesc = "";
let currentPageIndex = null;

/* drag state */
let draggedBlock = null;
let currentDropTarget = null;

/*utility functions */
const id = () => `page-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/* sidebar resize */
function maximizeSidebar() {
  const resizeHandle = document.querySelector("#maximize");

  sidebar.addEventListener("mouseenter", () => {
    resizeHandle.style.opacity = 1;
  });

  resizeHandle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isResize = true;
    sidebar.classList.add("enter");
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResize) return;

    let newWidth = e.clientX - sidebar.getBoundingClientRect().left;

    if (newWidth <= min) newWidth = min;
    else if (newWidth >= max) newWidth = max;

    sidebar.style.width = newWidth + "px";
    const allBindTitles = document.querySelectorAll(".bindTitle");
    const currentTitle = pageObj?.contents[0]?.title || "";
    allBindTitles.forEach((bindTitle) => {
      const pageOptions = bindTitle.closest(".page-options");
      const pageId = pageOptions?.id;
      const page = pages.find((p) => p.id === pageId);
      const pageTitle = page?.contents[0]?.title || currentTitle;
      bindTitle.innerText = autoSliceTitle(pageTitle, newWidth);
    });

    headEditTitle.innerText = autoSliceTitle(currentTitle, newWidth);
  });

  document.addEventListener("mouseup", () => {
    isResize = false;
    resizeHandle.style.opacity = 0;
    sidebar.classList.remove("enter");
  });
}

/* tooltip */
function toolTipGenerator(dataTooltip) {
  dataTooltip.forEach((item) => {
    const content = item.dataset.tooltip;

    item.addEventListener("mouseenter", (e) => {
      toolTip.style.display = "block";
      toolTip.style.top = e.clientY + 15 + "px";
      toolTip.style.left = e.clientX - 30 + "px";
      toolTip.innerHTML = content;
    });

    item.addEventListener("mouseleave", () => {
      toolTip.style.display = "none";
    });
  });
}

private.addEventListener("mouseenter", () => {
  features.style.opacity = 1;
});
private.addEventListener("mouseleave", () => {
  features.style.opacity = 0;
});

/* page create */
function pageCreate() {
  const oldBanner = editor.querySelector(".banner");
  if (oldBanner) {
    oldBanner.remove();
  }
  const oldIcon = editor.querySelector(".icon");
  if (oldIcon) {
    oldIcon.remove();
  }
  editorContent.innerText = "";
  editerHeader.style.opacity = 1;

  const HeadingOne = document.createElement("h1");
  HeadingOne.contentEditable = true;
  HeadingOne.classList.add("initialText");
  editorContent.appendChild(HeadingOne);
  HeadingOne.focus();

  attachBannerHover(HeadingOne);
  bannerOption.addEventListener("mouseleave", () => {
    bannerOption.style.display = "none";
  });

  pageObj = {
    id: id(),
    contents: [{ type: "h1", title: "" }],
    saved: true,
    thumbnail: "",
    icon: "",
  };

  const tablocation = document.createElement("div");
  tablocation.innerHTML = `
    <div class="page-options" id="${pageObj.id}">
      <i class="ri-pages-fill"></i>
      <p class="bindTitle">New Page</p>
    </div>
  `;
  tabExist.append(tablocation);

  const bindTitle = tablocation.querySelector(".bindTitle");
  const sidebarWidth = sidebar.getBoundingClientRect().width;

  currentBindTitle = bindTitle;
  currentTitleElement = HeadingOne;

  HeadingOne.addEventListener("input", () => {
    const content = HeadingOne.innerText;

    pageObj.contents[0].title = content;
    const sliced = autoSliceTitle(content, sidebarWidth);

    bindTitle.innerText = sliced;
    headEditTitle.innerText = sliced;
    editboxInput.value = content;
  });

  pages.push(pageObj);
  localStorage.setItem("pages", JSON.stringify(pages));
}

function attachBannerHover(h1) {
  h1.addEventListener("mouseenter", () => {
    bannerOption.style.display = "flex";
    const rect = h1.getBoundingClientRect();
    bannerOption.style.top = rect.top - 30 + "px";
  });

  h1.addEventListener("mouseleave", (e) => {
    if (bannerOption.contains(e.relatedTarget)) return;
    bannerOption.style.display = "none";
  });
}

/* cover & icon */
addCoverOptions.addEventListener("click", () => {
  const existingBanner = editor.querySelector(".banner");
  if (existingBanner) return;
  const bannerElem = document.createElement("div");
  const img = document.createElement("img");
  img.src =
    "https://images.unsplash.com/photo-1573455494060-c5595004fb6c?q=80&w=1140&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  bannerElem.appendChild(img);
  bannerElem.classList.add("banner");
  const existingIcon = editor.querySelector(".icon");
  if (existingIcon) {
    bannerElem.appendChild(existingIcon);
  }
  editor.insertBefore(bannerElem, editorContent);
  pageObj.thumbnail = img.src;
  localStorage.setItem("pages", JSON.stringify(pages));
});

addIconOptions.addEventListener("click", () => {
  const oldIcon = editor.querySelector(".icon");
  if (oldIcon) oldIcon.remove();

  const existingBanner = editor.querySelector(".banner");
  const IconElem = document.createElement("div");
  const img = document.createElement("img");

  img.src =
    "https://i.pinimg.com/736x/de/8d/5a/de8d5ab18ba872bb55068a9de99cbab0.jpg";

  IconElem.appendChild(img);
  IconElem.classList.add("icon");

  if (existingBanner) {
    existingBanner.appendChild(IconElem);
  } else {
    editorContent.parentNode.insertBefore(IconElem, editorContent);
  }

  if (pageObj) {
    pageObj.icon = img.src;
    localStorage.setItem("pages", JSON.stringify(pages));
  }
});

/* header title edit */
function editorHeaderChange() {
  headEditTitle.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!currentBindTitle && !currentTitleElement) return;

    editbox.style.display = "flex";
    editboxInput.focus();
    editboxInput.select();

    if (currentBindTitle) {
      editboxInput.value = currentBindTitle.innerText;
    } else if (currentTitleElement) {
      editboxInput.value = currentTitleElement.innerText;
    }
  });

  editboxInput.addEventListener("input", () => {
    const editBoxValue = editboxInput.value;

    if (pageObj && pageObj.contents[0]) {
      pageObj.contents[0].title = editBoxValue;
    }

    const sidebarWidth = sidebar.getBoundingClientRect().width;
    const sliced = autoSliceTitle(editBoxValue, sidebarWidth);

    if (currentBindTitle) {
      currentBindTitle.innerText = sliced;
    }

    headEditTitle.innerText = sliced;

    if (currentTitleElement) {
      currentTitleElement.innerText = editBoxValue;
    }

    localStorage.setItem("pages", JSON.stringify(pages));
  });

  document.addEventListener("click", () => {
    editbox.style.display = "none";
  });
}

/* title slicing */
function autoSliceTitle(text, sidebarWidth) {
  const charsPer100px = 12;
  const allowedChars = Math.floor((sidebarWidth / 100) * charsPer100px);

  if (text.length > allowedChars) {
    return text.slice(0, allowedChars - 2) + "...";
  }

  return text;
}

/* saveContent */
function saveContent(pageIndex, content, type, id) {
  const page = pages[pageIndex];
  if (!page) {
    localStorage.setItem("pages", JSON.stringify(pages));
    return;
  }

  if (type === "title") {
    page.contents[0].title = content;
  } else if (id != null) {
    const contentIndex = page.contents.findIndex((f) => f.id == id);
    if (contentIndex !== -1) {
      page.contents[contentIndex].desc = content;
      page.contents[contentIndex].type =
        type || page.contents[contentIndex].type;
    }
  }

  localStorage.setItem("pages", JSON.stringify(pages));
}

/* DRAG HELPERS */
function handleDragStart(e) {
  draggedBlock = e.target;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", draggedBlock.dataset.id);
  draggedBlock.classList.add("dragging");
}

function handleDragEnd() {
  if (draggedBlock) {
    draggedBlock.classList.remove("dragging");
    draggedBlock = null;
  }
  if (currentDropTarget) {
    currentDropTarget.classList.remove("drop-target");
    currentDropTarget = null;
  }
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".block[draggable='true']:not(.dragging)"),
  ];

  let closest = { offset: Number.NEGATIVE_INFINITY, element: null };

  draggableElements.forEach((child) => {
    const box = child.getBoundingClientRect();
    const offset = y - (box.top + box.height / 2);
    if (offset < 0 && offset > closest.offset) {
      closest = { offset, element: child };
    }
  });

  return closest.element;
}

function updateOrderFromDOM() {
  if (!pageObj) return;

  const blocks = [
    ...editorContent.querySelectorAll(".block[draggable='true']"),
  ];
  const idOrder = blocks.map((b) => b.dataset.id);

  const map = new Map(pageObj.contents.map((c) => [c.id, c]));
  const newContents = [];

  const titleBlock = pageObj.contents.find((c) => c.type === "h1");
  if (titleBlock) newContents.push(titleBlock);

  idOrder.forEach((bid) => {
    const item = map.get(bid);
    if (item && item !== titleBlock) newContents.push(item);
  });

  pageObj.contents = newContents;
  if (currentPageIndex != null) {
    pages[currentPageIndex] = pageObj;
  }
  localStorage.setItem("pages", JSON.stringify(pages));
}

/* AddBlocks: create new paragraph block + drag */
function AddBlocks() {
  const block = document.createElement("div");
  block.contentEditable = true;
  block.classList.add("block");
  block.dataset.id = id();
  block.setAttribute("draggable", "true");
  editorContent.appendChild(block);

  const blockId = block.dataset.id;

  block.addEventListener("input", () => {
    const text = block.innerHTML.trim();
    const index = pageObj.contents.findIndex((item) => item.id == blockId);
    if (index !== -1) {
      pageObj.contents[index].desc = text;
      pageObj.contents[index].type =
        pageObj.contents[index].type || "paragraph";
    } else {
      pageObj.contents.push({
        id: blockId,
        type: "paragraph",
        desc: text,
      });
    }
    localStorage.setItem("pages", JSON.stringify(pages));
  });

  block.addEventListener("dragstart", handleDragStart);
  block.addEventListener("dragend", handleDragEnd);

  block.focus();
  block.addEventListener("keydown", (e) => {
    const rect = block.getBoundingClientRect();
    if (e.key === "/") {
      e.preventDefault();
      basicOption.style.display = "flex";
      basicOption.style.top = rect.top + 30 + "px";
      activeBlock = block;
    }
  });

  document.body.addEventListener("click", () => {
    basicOption.style.display = "none";
  });
}

/* basic options */
headingOne.addEventListener("click", () => {
  if (!activeBlock) return;
  const blockId = activeBlock.dataset.id;
  activeBlock.className = "block H-1";
  basicOption.style.display = "none";
  activeBlock.addEventListener("input", () => {
    saveOptions(blockId, activeBlock.innerHTML.trim(), "H-1");
  });
});

function saveOptions(id, data, type) {
  const index = pageObj.contents.findIndex((item) => item.id == id);

  if (index !== -1) {
    pageObj.contents[index].desc = data;
    pageObj.contents[index].type = type;
  } else {
    pageObj.contents.push({
      id: id,
      type: type,
      desc: data,
    });
  }

  localStorage.setItem("pages", JSON.stringify(pages));
}

headingTwo.addEventListener("click", () => {
  if (!activeBlock) return;
  const blockId = activeBlock.dataset.id;
  activeBlock.className = "block H-2";
  basicOption.style.display = "none";
  activeBlock.addEventListener("input", () => {
    saveOptions(blockId, activeBlock.innerHTML.trim(), "H-2");
  });
});

headingThree.addEventListener("click", () => {
  if (!activeBlock) return;
  const blockId = activeBlock.dataset.id;
  activeBlock.className = "block H-3";
  basicOption.style.display = "none";
  activeBlock.addEventListener("input", () => {
    saveOptions(blockId, activeBlock.innerHTML.trim(), "H-3");
  });
});

list.addEventListener("click", () => {
  if (!activeBlock) return;

  const blockId = activeBlock.dataset.id;

  activeBlock.className = "block List-Type";
  basicOption.style.display = "none";

  activeBlock.innerHTML = "<ul><li></li></ul>";

  const li = activeBlock.querySelector("li");
  li.focus();

  activeBlock.addEventListener("input", () => {
    const text = li.innerText.trim();
    saveOptions(blockId, text, "List");
  });
});

checkboxContent.addEventListener("click", () => {
  if (!activeBlock) return;

  const blockId = activeBlock.dataset.id;

  activeBlock.className = "block checkbox-type";
  basicOption.style.display = "none";

  activeBlock.innerHTML = `
    <div class="checkbox-item">
      <input type="checkbox" class="check-input" />
      <span class="check-text" contenteditable="true"></span>
    </div>
  `;

  const checkInput = activeBlock.querySelector(".check-input");
  const checkText = activeBlock.querySelector(".check-text");

  checkText.focus();

  saveOptions(blockId, { text: "", checked: false }, "checkbox");

  checkText.addEventListener("input", () => {
    saveOptions(
      blockId,
      {
        text: checkText.innerText.trim(),
        checked: checkInput.checked,
      },
      "checkbox"
    );
  });

  checkInput.addEventListener("change", () => {
    saveOptions(
      blockId,
      {
        text: checkText.innerText.trim(),
        checked: checkInput.checked,
      },
      "checkbox"
    );
  });
});

code.addEventListener("click", () => {
  if (!activeBlock) return;
  const blockId = activeBlock.dataset.id;
  activeBlock.className = "block code";
  basicOption.style.display = "none";
  activeBlock.addEventListener("input", () => {
    saveOptions(blockId, activeBlock.innerHTML.trim(), "code");
  });
});

/* page creation button */
addPage.addEventListener("click", () => {
  pageCreate();
});

/* sidebar tabs */
function displayTab() {
  const sidebarWidth = sidebar.getBoundingClientRect().width;

  pages.forEach((e) => {
    const tablocation = document.createElement("div");
    const slicedTitle = autoSliceTitle(e.contents[0].title || "", sidebarWidth);

    tablocation.innerHTML = `
      <div id="${e.id}" class="page-options">
        <i class="ri-pages-fill"></i>
        <p class="bindTitle">${slicedTitle}</p>
      </div>
    `;

    tabExist.append(tablocation);
  });

  displayPages();
}

/* display page + blocks */
function displayPages() {
  const currentPages = document.querySelectorAll(".page-options");
  const pageExceptFirst = [...currentPages].slice(1);

  pageExceptFirst.forEach((item) => {
    item.addEventListener("click", () => {
      editerHeader.style.opacity = 1;
      editorContent.innerHTML = "";
      const findPage = pages.find((f) => f.id === item.id);
      const pageIndex = pages.findIndex((f) => f.id === item.id);
      pageObj = findPage;
      currentPageIndex = pageIndex;

      if (!findPage) return;

      const bindTitle = item.querySelector(".bindTitle");
      currentBindTitle = bindTitle;

      const sidebarWidth = sidebar.getBoundingClientRect().width;
      const oldBanner = editor.querySelector(".banner");
      if (oldBanner) {
        oldBanner.remove();
      }
      const oldIcon = editor.querySelector(".icon");
      if (oldIcon) {
        oldIcon.remove();
      }

      if (findPage.thumbnail) {
        const bannerElem = document.createElement("div");
        const img = document.createElement("img");
        img.src = findPage?.thumbnail;
        bannerElem.appendChild(img);
        bannerElem.classList.add("banner");
        editor.insertBefore(bannerElem, editorContent);
      }
      if (findPage.icon) {
        const currentBanner = document.querySelector(".banner");
        const IconElem = document.createElement("div");
        const img = document.createElement("img");
        img.src = findPage?.icon;
        IconElem.appendChild(img);
        IconElem.classList.add("icon");
        if (currentBanner) {
          currentBanner.appendChild(IconElem);
        } else {
          editorContent.parentNode.insertBefore(IconElem, editorContent);
        }
      }

      findPage.contents.forEach((page) => {
        if (page.type === "h1") {
          const h1title = document.createElement("h1");
          h1title.contentEditable = true;
          h1title.classList.add("initialText");
          h1title.innerText = page.title || "";

          editorContent.appendChild(h1title);
          h1title.focus();
          attachBannerHover(h1title);
          currentTitleElement = h1title;

          const sliced = autoSliceTitle(page.title, sidebarWidth);
          headEditTitle.innerText = sliced;
          editboxInput.value = page.title;

          h1title.addEventListener("input", () => {
            const content = h1title.innerText;

            pageObj.contents[0].title = content;
            const slicedInner = autoSliceTitle(content, sidebarWidth);

            bindTitle.innerText = slicedInner;
            headEditTitle.innerText = slicedInner;
            editboxInput.value = content;
            saveContent(pageIndex, content, "title");
          });
        }
        if (page.type === "H-1") {
          const block = document.createElement("div");
          block.dataset.id = page.id;
          block.innerHTML = page.desc || "";
          block.className = "H-1 block";
          block.contentEditable = true;
          block.setAttribute("draggable", "true");
          block.addEventListener("dragstart", handleDragStart);
          block.addEventListener("dragend", handleDragEnd);
          editorContent.appendChild(block);
          block.addEventListener("input", () => {
            const content = block.innerHTML;
            saveContent(pageIndex, content, "H-1", page.id);
          });
        }
        if (page.type === "H-2") {
          const block = document.createElement("div");
          block.dataset.id = page.id;
          block.innerHTML = page.desc || "";
          block.className = "H-2 block";
          block.contentEditable = true;
          block.setAttribute("draggable", "true");
          block.addEventListener("dragstart", handleDragStart);
          block.addEventListener("dragend", handleDragEnd);
          editorContent.appendChild(block);
          block.addEventListener("input", () => {
            const content = block.innerHTML;
            saveContent(pageIndex, content, "H-2", page.id);
          });
        }
        if (page.type === "H-3") {
          const block = document.createElement("div");
          block.dataset.id = page.id;
          block.innerHTML = page.desc || "";
          block.className = "H-3 block";
          block.contentEditable = true;
          block.setAttribute("draggable", "true");
          block.addEventListener("dragstart", handleDragStart);
          block.addEventListener("dragend", handleDragEnd);
          editorContent.appendChild(block);
          block.addEventListener("input", () => {
            const content = block.innerHTML;
            saveContent(pageIndex, content, "H-3", page.id);
          });
        }
        if (page.type === "code") {
          const block = document.createElement("div");
          block.dataset.id = page.id;
          block.innerHTML = page.desc || "";
          block.className = "code block";
          block.contentEditable = true;
          block.setAttribute("draggable", "true");
          block.addEventListener("dragstart", handleDragStart);
          block.addEventListener("dragend", handleDragEnd);
          editorContent.appendChild(block);
          block.addEventListener("input", () => {
            const content = block.innerHTML;
            saveContent(pageIndex, content, "code", page.id);
          });
        }
        if (page.type === "List") {
          const block = document.createElement("div");
          block.dataset.id = page.id;
          block.innerHTML =
            page.type === "List" ? `<ul><li>${page.desc}</li></ul>` : "";
          block.className = "block List-Type";
          block.contentEditable = true;
          block.setAttribute("draggable", "true");
          block.addEventListener("dragstart", handleDragStart);
          block.addEventListener("dragend", handleDragEnd);
          editorContent.appendChild(block);
          block.addEventListener("input", () => {
            const content = block.innerHTML;
            saveContent(pageIndex, content, "List", page.id);
          });
        }
        if (page.type === "paragraph") {
          const block = document.createElement("div");
          block.dataset.id = page.id;
          block.innerHTML = page.desc || "";
          block.className = "block";
          block.contentEditable = true;
          block.setAttribute("draggable", "true");
          block.addEventListener("dragstart", handleDragStart);
          block.addEventListener("dragend", handleDragEnd);
          editorContent.appendChild(block);

          block.addEventListener("input", () => {
            const text = block.innerHTML.trim();
            const index = pageObj.contents.findIndex(
              (item) => item.id == page.id
            );
            if (index !== -1) {
              pageObj.contents[index].desc = text;
            }
            localStorage.setItem("pages", JSON.stringify(pages));
          });
        }
        if (page.type === "checkbox") {
          const block = document.createElement("div");
          block.dataset.id = page.id;
          block.className = "block checkbox-type";
          block.contentEditable = true;
          block.setAttribute("draggable", "true");
          const checked = page.desc.checked ? "checked" : "";
          block.innerHTML = `
            <div class="checkbox-item">
              <input type="checkbox" class="check-input" ${checked} />
              <span class="check-text" contenteditable="true">${
                page.desc.text || ""
              }</span>
            </div>
          `;
          block.addEventListener("dragstart", handleDragStart);
          block.addEventListener("dragend", handleDragEnd);
          editorContent.appendChild(block);

          const checkInput = block.querySelector(".check-input");
          const checkText = block.querySelector(".check-text");

          checkText.addEventListener("input", () => {
            saveOptions(
              page.id,
              {
                text: checkText.innerText.trim(),
                checked: checkInput.checked,
              },
              "checkbox"
            );
          });

          checkInput.addEventListener("change", () => {
            saveOptions(
              page.id,
              {
                text: checkText.innerText.trim(),
                checked: checkInput.checked,
              },
              "checkbox"
            );
          });
        }
      });
    });
  });
}

/* drag over/drop on editorContent */
editorContent.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!draggedBlock) return;

  const afterElement = getDragAfterElement(editorContent, e.clientY);

  if (currentDropTarget) {
    currentDropTarget.classList.remove("drop-target");
    currentDropTarget = null;
  }

  if (afterElement == null) {
    editorContent.appendChild(draggedBlock);
  } else {
    currentDropTarget = afterElement;
    currentDropTarget.classList.add("drop-target");
    editorContent.insertBefore(draggedBlock, afterElement);
  }
});

editorContent.addEventListener("drop", (e) => {
  e.preventDefault();
  updateOrderFromDOM();
  if (currentDropTarget) {
    currentDropTarget.classList.remove("drop-target");
    currentDropTarget = null;
  }
});

/* search */
function searchEnable() {
  searchTab.addEventListener("click", (e) => {
    e.stopPropagation();
    searchBar.style.display = "block";
  });
  searchBar.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  document.body.addEventListener("click", () => {
    searchBar.style.display = "none";
  });
  searchInput.addEventListener("input", (e) => {
    searchArea.innerHTML = "";
    const value = e.target.value.trim().toLowerCase();

    if (value === "") return;

    const searchedPage = pages.find((p) =>
      p.contents[0].title.toLowerCase().includes(value)
    );

    function highlight(text, keyword) {
      const regex = new RegExp(`(${keyword})`, "ig");
      return text.replace(regex, `<span class="highlight">$1</span>`);
    }

    if (searchedPage) {
      const pageElem = document.createElement("div");
      pageElem.className = "pages";
      pageElem.id = searchedPage.id;

      pageElem.innerHTML = `
        <i class="ri-pages-line"></i>
        <p>${highlight(searchedPage.contents[0].title, value)}</p>
      `;

      pageElem.addEventListener("click", () => {
        const pageTab = document.querySelector(`#${searchedPage.id}`);
        if (pageTab) {
          pageTab.click();
          searchBar.style.display = "none";
        }
      });

      searchArea.appendChild(pageElem);
    }
  });
}

/* Enter handler: new block */
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.ctrlKey) {
    if (!editor.contains(document.activeElement)) return;

    e.preventDefault();

    localStorage.setItem("pages", JSON.stringify(pages));

    AddBlocks();

    ctrlSave.style.right = "1%";
    setTimeout(() => {
      ctrlSave.style.right = "-100%";
    }, 2000);
  }
});

/* theme toggle */
const savedTheme = localStorage.getItem("theme") || "dark";
document.body.setAttribute("data-theme", savedTheme);
if (themeToggle) {
  themeToggle.innerHTML =
    savedTheme === "dark"
      ? ' <i class="ri-sun-line"></i>'
      : '<i class="ri-moon-line"></i>';

  themeToggle.addEventListener("click", () => {
    const current = document.body.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";

    document.body.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);

    themeToggle.innerHTML =
      next === "dark"
        ? '<i class="ri-sun-line"></i>'
        : '<i class="ri-moon-line"></i>';
  });
}

/* init */
searchEnable();
maximizeSidebar();
toolTipGenerator(dataTooltip);
editorHeaderChange();
displayTab();
