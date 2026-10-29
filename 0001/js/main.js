/* ケントホームズ様（KD'STYLE）SUUMO フリーページ
   #includeContent は書き出し時に PC：#includeContent ／スマホ：#kosha_free に置き換わる。
   SUUMO の PC ページは jQuery 1.4 系、スマホは独自のため、jQuery に頼らない素の JavaScript で書く */
(function () {
  var root = document.querySelector("#includeContent .kd");
  if (!root || !root.querySelectorAll) return;

  // SVG 要素でも動くよう、class の付け外しは className ではなく属性で行う
  function hasClass(el, c) { return (" " + (el.getAttribute("class") || "") + " ").indexOf(" " + c + " ") > -1; }
  function setClass(el, c, on) {
    var list = (el.getAttribute("class") || "").split(/\s+/), out = [], i;
    for (i = 0; i < list.length; i++) if (list[i] && list[i] !== c) out.push(list[i]);
    if (on) out.push(c);
    el.setAttribute("class", out.join(" "));
  }
  function each(sel, fn) { var els = root.querySelectorAll(sel); for (var i = 0; i < els.length; i++) fn(els[i]); }

  // JS が動く環境でだけ、開閉部分を閉じ、店舗を1件ずつ表示にする
  setClass(root, "is-js", true);

  // ---- ページ内リンク（地図へ移動など）----
  // SUUMO のページには <base href> があるため、"#..." のリンクはそのままだと SUUMO の別ページへ飛んでしまう。
  // JS でページ内の位置までスクロールさせる
  each("[data-kd-jump]", function (link) {
    link.onclick = function (e) {
      var id = (link.getAttribute("href") || "").replace(/^.*#/, "");
      var target = id && document.getElementById(id);
      if (!target) return true;
      if (e && e.preventDefault) e.preventDefault();
      // PC は SUUMO のヘッダーが上に固定されるのでその分（70px）、スマホは固定されないので少しだけ手前で止める
      var offset = window.innerWidth < 768 ? 12 : 70;
      var top = target.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - offset;
      try { window.scrollTo({ top: top, behavior: "smooth" }); } catch (err) { window.scrollTo(0, top); }
      return false;
    };
  });

  // ---- もっと見る（開閉） ----
  each("[data-kd-more]", function (btn) {
    var box = btn.parentNode, body = box.querySelector(".kd-more__body");
    if (!body) return;
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", body.id);
    btn.onclick = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      var open = !hasClass(box, "is-open");
      setClass(box, "is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      // 高さを数値にしてから動かす（height:auto には transition が効かないため）
      body.style.height = (open ? 0 : body.scrollHeight) + "px";
      body.offsetHeight; // 再計算させる
      body.style.height = (open ? body.scrollHeight + 24 : 0) + "px";
      if (open) {
        setTimeout(function () { if (hasClass(box, "is-open")) body.style.height = "auto"; }, 450);
      }
      return false;
    };
  });

  // ---- 店舗マップ：地図の地名・タブのどちらからでも拠点を切り替える ----
  var map = root.querySelector("[data-kd-map]");
  if (map) {
    var panelTop = map.querySelector(".kd-map__panel");
    var activate = function (area, fromMap) {
      each("[data-kd-map] [data-area]", function (el) {
        var on = el.getAttribute("data-area") === area;
        setClass(el, "is-active", on);
        if (el.getAttribute("role") === "tab") el.setAttribute("aria-selected", on ? "true" : "false");
      });
      // スマホで地図を押したときは、切り替わった店舗情報が見える位置まで送る
      if (fromMap && panelTop && window.innerWidth < 768 && panelTop.getBoundingClientRect) {
        var top = panelTop.getBoundingClientRect().top;
        if (top > window.innerHeight * 0.6) window.scrollBy(0, top - 16);
      }
    };
    each("[data-kd-map] .kd-tabs__btn", function (tab) {
      tab.onclick = function (e) {
        if (e && e.preventDefault) e.preventDefault();
        activate(tab.getAttribute("data-area"), false);
        return false;
      };
    });
    each("[data-kd-map] .kd-map__spot", function (spot) {
      var go = function () { activate(spot.getAttribute("data-area"), true); };
      spot.onclick = go;
      spot.onkeydown = function (e) {
        var k = e.key || e.keyCode;
        if (k === "Enter" || k === " " || k === 13 || k === 32) { if (e.preventDefault) e.preventDefault(); go(); }
      };
    });
    activate("minoh", false);
  }
})();
