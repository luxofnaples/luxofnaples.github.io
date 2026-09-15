
(function(){
  window.BIZBOT_FORM_WEBHOOK = "http://127.0.0.1:4320/api/form-submit";
  const company = "Luxofnaples";
  function toast(msg){ alert(msg); }
  async function deliver(payload) {
    const hook = window.BIZBOT_FORM_WEBHOOK || "";
    if (hook) {
      try {
        const r = await fetch(hook, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...payload, source: "bizbot-store", page: location.pathname }),
        });
        if (r.ok) return true;
      } catch (_) {}
    }
    try {
      const key = "store_inbox";
      const box = JSON.parse(localStorage.getItem(key) || "[]");
      box.unshift(payload);
      localStorage.setItem(key, JSON.stringify(box.slice(0, 40)));
    } catch (_) {}
    return false;
  }
  const news = document.getElementById("newsletter");
  if (news) news.onsubmit = async (e) => {
    e.preventDefault();
    const email = (new FormData(news).get("email") || "").toString();
    await deliver({ topic: "Newsletter", email, company, at: new Date().toISOString() });
    toast("Thank you for subscribing to " + (company || "our store") + ".");
    news.reset();
  };
  document.querySelectorAll("[data-store-contact]").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const support = form.getAttribute("data-support") || "";
      const payload = {
        to: support,
        topic: "Store contact",
        name: fd.get("name") || "",
        email: fd.get("email") || "",
        message: fd.get("message") || "",
        company,
        at: new Date().toISOString(),
      };
      const ok = await deliver(payload);
      form.reset();
      toast(ok ? "Message sent — we'll reply soon." : "Request saved. We'll follow up by email.");
    });
  });
})();
