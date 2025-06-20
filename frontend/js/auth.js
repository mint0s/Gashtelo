document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  const msg = document.getElementById("signupMsg");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const userType = document.getElementById("userType").value;

      try {
        const res = await fetch("https://gashtelo-production.up.railway.app/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, userType })
        });

        const data = await res.json();

        if (res.ok) {
          msg.textContent = "✅ Registration successful!";
          msg.style.color = "green";
          msg.style.display = "block";
          form.reset();
        } else {
          msg.textContent = "❌ " + (data.message || "Registration failed.");
          msg.style.color = "red";
          msg.style.display = "block";
        }
      } catch (err) {
        console.error("Signup error:", err);
        msg.textContent = "❌ Something went wrong.";
        msg.style.color = "red";
        msg.style.display = "block";
      }
    });
  }
});
