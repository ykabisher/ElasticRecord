window.Utils = (function () {
    function Utils() {
    }

    Utils.prototype.simulateClickOn = function (htmlElement, {clientX: left, clientY: top}) {
        const clickDiv = document.createElement('div');
        clickDiv.classList.add('click-effect');
        Object.assign(clickDiv.style, {top, left});
        htmlElement.appendChild(clickDiv);
        clickDiv.addEventListener('animationend', () => {
            clickDiv.parentNode.removeChild(clickDiv);
        });
    };

    Utils.prototype.createCursorElementOn = function (htmlElement) {
        const cursor = document.createElement('img');
        cursor.setAttribute('src', 'cursor.svg');
        cursor.classList.add('cursor');
        cursor.style.position = 'absolute';
        cursor.style.width = '30px';
        cursor.style.height = '30px';
        cursor.style.left = '0px';
        cursor.style.top = '0px';
        cursor.style.transition = 'transform 0.25s';
        return htmlElement.appendChild(cursor);
    };

    Utils.prototype.insertCSS = function () {
        const cssTag = document.createElement('link');
        const options = {
            rel: 'stylesheet',
            href: 'player_content.css'
        };
        Object.assign(cssTag, options);
        document.querySelector('head').appendChild(cssTag);
    };

    Utils.prototype.resetDom = function () {
        while (document.firstChild) {
            document.removeChild(document.firstChild);
        }
    };

    return new Utils();
})();
