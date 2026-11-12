document.addEventListener("DOMContentLoaded", () => {

    loadComponent(
        "navbar",
        "components/navbar.html"
    ).then(() => {

        // Initialize navbar functionality
        initializeNavbar();

            /* =====================================
       ACTIVE NAVIGATION LINK
    ===================================== */

    const currentPage =
        window.location.pathname.split("/").pop() || "index.html";

    const navLinks =
        document.querySelectorAll(".nav-links a");

    navLinks.forEach(link => {

        const linkPage =
            link.getAttribute("href");

        if (
            linkPage &&
            !linkPage.includes("#") &&
            linkPage === currentPage
        ) {

            link.classList.add("active");

        }

    });



    });


    loadComponent(
        "footer",
        "components/footer.html"
    );

});


async function loadComponent(
    elementId,
    componentPath
) {

    const element =
        document.getElementById(elementId);

    if (!element) return;

    try {

        const response =
            await fetch(componentPath);

        if (!response.ok) {

            throw new Error(
                `Could not load ${componentPath}`
            );

        }

        element.innerHTML =
            await response.text();

    }

    catch (error) {

        console.error(
            "Component loading error:",
            error
        );

    }

}


/* =====================================
   NAVBAR FUNCTIONALITY
===================================== */

function initializeNavbar() {

    const menuToggle =
        document.querySelector(".menu-toggle");

    const mobileMenu =
        document.querySelector(".mobile-menu");

    const header =
        document.querySelector(".header");


    /* Mobile Menu */

    if (menuToggle && mobileMenu) {

        const setMenu = open => {

            menuToggle.classList.toggle("active", open);
            mobileMenu.classList.toggle("active", open);

            menuToggle.setAttribute("aria-expanded", String(open));
            menuToggle.setAttribute(
                "aria-label",
                open ? "Close menu" : "Open menu"
            );

        };

        menuToggle.addEventListener(
            "click",
            () => setMenu(
                !mobileMenu.classList.contains("active")
            )
        );

        // Escape closes the menu (keyboard users)
        document.addEventListener("keydown", event => {

            if (
                event.key === "Escape" &&
                mobileMenu.classList.contains("active")
            ) {
                setMenu(false);
                menuToggle.focus();
            }

        });


        const mobileLinks =
            document.querySelectorAll(
                ".mobile-menu a"
            );


        mobileLinks.forEach(link => {

            link.addEventListener(
                "click",
                () => setMenu(false)
            );

        });

    }


    /* Header Scroll */

    if (header) {

        window.addEventListener(
            "scroll",
            () => {

                if (window.scrollY > 40) {

                    header.classList.add(
                        "scrolled"
                    );

                }

                else {

                    header.classList.remove(
                        "scrolled"
                    );

                }

            }
        );

    }

}