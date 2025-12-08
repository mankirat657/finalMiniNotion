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
let pages = JSON.parse(localStorage.getItem("pages")) || [];
let pageObj = null;
let currentBindTitle = null;
let currentTitleElement = null;
/*utility functions */
const id = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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
      // Find which page this tab belongs to
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

function pageCreate() {
  editorContent.innerText = "";
  editerHeader.style.opacity = 1;

  const HeadingOne = document.createElement("h1");
  HeadingOne.contentEditable = true;
  HeadingOne.classList.add("initialText");
  editorContent.appendChild(HeadingOne);
  HeadingOne.focus();
  //banner,logo functionality
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
  saveContent();
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

  if (pageObj) pageObj.icon = img.src;
});

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

  // typing in edit box updates current page title
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
  });

  // close edit box on outside click
  document.addEventListener("click", () => {
    editbox.style.display = "none";
  });
}

/* adding pages in the tab */
function autoSliceTitle(text, sidebarWidth) {
  const charsPer100px = 12;
  const allowedChars = Math.floor((sidebarWidth / 100) * charsPer100px);

  if (text.length > allowedChars) {
    return text.slice(0, allowedChars - 2) + "...";
  }

  return text;
}

/* saveContent function */
function saveContent(pageIndex, content) {
  console.log(pageIndex);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || (e.ctrlKey && e.key === "s")) {
      e.preventDefault();

      ctrlSave.style.right = "1%";
      setTimeout(() => {
        ctrlSave.style.right = "-100%";
      }, 2000);

      localStorage.setItem("pages", JSON.stringify(pages));
    } else if (e.key === "Enter" && pageIndex) {
      pages[pageIndex].contents[0].title = content;
      localStorage.setItem("pages", JSON.stringify(pages));
    }
  });
}

/* page creation button */
addPage.addEventListener("click", () => {
  pageCreate();
});

/* main part display the page and tab */
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

function displayPages() {
  const currentPages = document.querySelectorAll(".page-options");
  const pageExceptFirst = [...currentPages].slice(1);

  pageExceptFirst.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      editerHeader.style.opacity = 1;
      editorContent.innerHTML = "";
      const findPage = pages.find((f) => f.id === item.id);
      console.log(findPage);
      const pageIndex = pages.findIndex((f) => f.id === item.id);
      pageObj = findPage;

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
        currentBanner.appendChild(IconElem);
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
            saveContent(pageIndex, content);
          });
        }
      });
    });
  });
}

maximizeSidebar();
toolTipGenerator(dataTooltip);
editorHeaderChange();
displayTab();
