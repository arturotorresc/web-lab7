const API_TOKEN = "2abbf7c3-245b-404f-9473-ade729ed4653";

const handleDelete = (event) => {
  event.preventDefault();
  const id = document.getElementById("delete-id").value;
  const httpUrl = "/bookmark";
  const options = {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
  };
  fetch(httpUrl + `/${id}`, options)
    .then((res) => {
      if (res.ok) {
        const console = document.getElementById("console");
        console.innerHTML = "";
        console.innerHTML = res.statusText;
        return;
      }
      throw new Error(res.statusText);
    })
    .catch((err) => {
      handleError(err.message);
    });
};

const registerDelete = () => {
  const form = document.querySelector("#delete-bookmarks form");
  form.addEventListener("submit", handleDelete);
};

const handlePatch = (event) => {
  event.preventDefault();
  const id = document.getElementById("patch-id").value;
  const title = document.getElementById("patch-title").value.toLowerCase();
  const description = document.getElementById("patch-desc").value;
  const rating = document.getElementById("patch-rating").value;
  if (isNaN(Number(rating))) {
    window.alert("Rating must be a number!!!!");
    return;
  }
  const url = document.getElementById("patch-url").value;
  const data = {
    id,
    title: title || undefined,
    description: description || undefined,
    rating: rating || undefined,
    url: url || undefined,
  };
  const httpUrl = "/bookmark";
  const options = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify(data),
  };
  fetch(httpUrl + `/${id}`, options)
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then((json) => {
      const console = document.querySelector("#console");
      console.innerHTML = "";
      console.innerHTML = showBookmark(json.bookmark);
    })
    .catch((err) => {
      handleError(err.message);
    });
};

const registerPatch = () => {
  const form = document.querySelector("#put-bookmarks form");
  form.addEventListener("submit", handlePatch);
};

const handlePost = (event) => {
  event.preventDefault();
  const title = document.getElementById("post-title").value.toLowerCase();
  const description = document.getElementById("post-desc").value;
  const rating = document.getElementById("post-rating").value;
  if (isNaN(Number(rating))) {
    window.alert("Rating must be a number!!!!");
    return;
  }
  const url = document.getElementById("post-url").value;
  const data = { title, description, rating, url };
  const httpUrl = "/bookmarks";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify(data),
  };
  fetch(httpUrl, options)
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then((json) => {
      const console = document.querySelector("#console");
      console.innerHTML = "";
      console.innerHTML = showBookmark(json.bookmark);
    })
    .catch((err) => {
      handleError(err.message);
    });
};

const registerPost = () => {
  const form = document.querySelector("#post-bookmarks form");
  form.addEventListener("submit", handlePost);
};

const handleGet = (event) => {
  event.preventDefault();
  const title = document.getElementById("get-title").value.toLowerCase();
  const url = "/bookmark";
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
  };
  fetch(url + `?title=${title}`, options)
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then((json) => {
      const console = document.querySelector("#console");
      console.innerHTML = "";
      for (let b of json.bookmarks) {
        console.innerHTML += showBookmark(b);
      }
    })
    .catch((err) => {
      handleError(err.message);
    });
};

const registerGet = () => {
  const form = document.querySelector("#get-bookmarks form");
  form.addEventListener("submit", handleGet);
};

const fetchAllBookmarks = () => {
  const url = "/bookmarks";

  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
  };
  fetch(url, options)
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then((json) => {
      const console = document.querySelector("#console");
      console.innerHTML = "";
      for (let b of json.bookmarks) {
        console.innerHTML += showBookmark(b);
      }
    })
    .catch((err) => {
      handleError(err.message);
    });
};

const showBookmark = (b) => {
  return `
  <div class="result-item">
    <div>
      ${b._id}
    </div>
    <div>
      ${b.title}
    </div>
    <div>
      ${b.description}
    </div>
    <div>
      ${b.url}
    </div>
    <div>
      ${b.rating}
    </div>
  </div>
  `;
};

const handleError = (msg) => {
  const console = document.querySelector("#console");
  console.innerHTML = "";
  console.innerHTML = `
      <div>An error has occurred: ${msg}</div>
    `;
};

window.addEventListener("DOMContentLoaded", () => {
  registerGet();
  registerPost();
  registerPatch();
  registerDelete();
  fetchAllBookmarks();
});
