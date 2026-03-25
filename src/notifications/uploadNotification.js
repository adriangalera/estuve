const DISMISS_DELAY_MS = 5000;

export const showNewPointsNotification = (count, i18next) => {
    const existing = document.getElementById('new-points-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'new-points-toast';
    toast.className = 'new-points-toast';
    toast.setAttribute('role', 'status');

    const icon = count > 0 ? '📍' : '✓';
    let message, countDisplay;
    if (count === 0) {
        message = i18next.t('upload.newPoints.zero');
        countDisplay = '';
    } else if (count === 1) {
        message = i18next.t('upload.newPoints.one');
        countDisplay = '1';
    } else {
        message = i18next.t('upload.newPoints.other', { count });
        countDisplay = count.toLocaleString();
    }

    const content = document.createElement('div');
    content.className = 'new-points-toast-content';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'new-points-toast-icon';
    iconSpan.textContent = icon;
    content.appendChild(iconSpan);

    const textDiv = document.createElement('div');
    textDiv.className = 'new-points-toast-text';
    if (countDisplay) {
        const countSpan = document.createElement('span');
        countSpan.className = 'new-points-toast-count';
        countSpan.textContent = countDisplay;
        textDiv.appendChild(countSpan);
    }
    const messageSpan = document.createElement('span');
    messageSpan.className = 'new-points-toast-message';
    messageSpan.textContent = message;
    textDiv.appendChild(messageSpan);
    content.appendChild(textDiv);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'new-points-toast-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '×';
    content.appendChild(closeBtn);

    const progressBar = document.createElement('div');
    progressBar.className = 'new-points-toast-progress';

    toast.appendChild(content);
    toast.appendChild(progressBar);

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('new-points-toast--visible');
    });

    progressBar.style.animationDuration = `${DISMISS_DELAY_MS}ms`;
    progressBar.classList.add('new-points-toast-progress--running');

    const dismiss = () => {
        toast.classList.remove('new-points-toast--visible');
        toast.classList.add('new-points-toast--hiding');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    };

    const timer = setTimeout(dismiss, DISMISS_DELAY_MS);

    closeBtn.addEventListener('click', () => {
        clearTimeout(timer);
        dismiss();
    });
};

export const registerUploadNotification = (i18next) => {
    document.addEventListener('newPointsAdded', (event) => {
        showNewPointsNotification(event.detail.count, i18next);
    });
};
