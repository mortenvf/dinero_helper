result = await (async () => {
    const viewport = document.querySelector(
        'cdk-virtual-scroll-viewport.virtual-container'
    );

    if (!viewport) {
        console.error('Virtual scroll viewport not found');
        return;
    }

    const transactions = new Map();

    const wait = ms =>
        new Promise(resolve => setTimeout(resolve, ms));

    const collect = () => {
        for (const line of viewport.querySelectorAll(
            'transaction-line-component'
        )) {
            const item = line.querySelector('.reconciliation-item');
            if (!item) continue;

            const id = item.getAttribute('transaction-id');
            if (!id) continue;

            const getText = cls =>
                line.querySelector(
                    `.${cls} p.transaction-line-text`
                )?.textContent.trim() ?? '';

            transactions.set(id, {
                id,
                date: getText('reconciliation-item-date'),
                description: getText('reconciliation-item-description'),
                amount: getText('reconciliation-item-amount')
            });
        }
    };

    // Start at the top
    viewport.scrollTop = 0;
    await wait(300);

    let previousPosition = -1;
    let iterations = 0;

    while (iterations++ < 10000) {
        collect();

        const maxScroll =
            viewport.scrollHeight - viewport.clientHeight;

        if (viewport.scrollTop >= maxScroll - 2) {
            break;
        }

        const nextPosition = Math.min(
            viewport.scrollTop + viewport.clientHeight * 0.8,
            maxScroll
        );

        viewport.scrollTop = nextPosition;

        await wait(200);

        if (viewport.scrollTop === previousPosition) {
            console.warn('Scrolling stopped unexpectedly');
            break;
        }

        previousPosition = viewport.scrollTop;
    }

    // Capture the final visible items
    collect();

    const result = [...transactions.values()];

    console.log(`Extracted ${result.length} transactions`);
    console.table(result);
    return result;


})();