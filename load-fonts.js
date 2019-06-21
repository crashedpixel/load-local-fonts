(function () {
    function load (font) {
        var name = font.getAttribute('data-cache-name');
        var css = localStorage.getItem(name);
        if (css) {
            font.innerHTML = css;
        } else {
            var xhr = new XMLHttpRequest;
            xhr.open("GET", '/fonts/' + name + '.json', true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    font.innerHTML = response.css;
                    localStorage.setItem(name, response.css);
                }
            };
            xhr.send()
        }
    }

    if ("localStorage" in window) {
        Array.from(document.querySelectorAll('.webfont')).forEach(function (font) {
            load(font);
        })
    } else {
        var fonts = document.createElement('link');
        fonts.rel = 'stylesheet';
        fonts.type = 'text/css';
        fonts.href = '/css/fonts.css';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(fonts);
    }
})();
