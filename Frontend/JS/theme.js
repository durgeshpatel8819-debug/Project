(function () {
    const savedTheme = localStorage.getItem("hrgeniusTheme");

    document.documentElement.setAttribute(
        "data-theme",
        savedTheme === "dark" ? "dark" : "light"
    );

    window.toggleTheme = function () {
        const currentTheme =
            document.documentElement.getAttribute("data-theme");

        const newTheme =
            currentTheme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", newTheme);

        localStorage.setItem("hrgeniusTheme", newTheme);

        updateThemeButton();
    };

    window.updateThemeButton = function () {
        const button = document.getElementById("themeToggle");

        if (!button) return;

        const currentTheme =
            document.documentElement.getAttribute("data-theme");

        if (currentTheme === "dark") {
            button.textContent = "☀️ Light Mode";
        } else {
            button.textContent = "🌙 Dark Mode";
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        updateThemeButton();
    });
})();