const loader = {
    onAdd: function () {
        const progressbar = L.DomUtil.create('progress', 'loader');
        return progressbar
    },
    loadWithCurrentTotal: (current, total) => {
        const progressbar = document.getElementsByClassName('loader')[0]
        if (!progressbar) return;
        progressbar.min = 0
        progressbar.max = total
        progressbar.value = current
        progressbar.style.display = "block"
    },
    load: () => {
        const progressbar = document.getElementsByClassName('loader')[0]
        if (!progressbar) return;
        progressbar.style.display = "block"
    },
    stop: () => {
        const progressbar = document.getElementsByClassName('loader')[0]
        if (!progressbar) return;
        progressbar.style.display = "none"
    }
}

export { loader }