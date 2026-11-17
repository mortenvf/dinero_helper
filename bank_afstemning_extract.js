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

            const description = getText('reconciliation-item-description');
            const account = description.match(/Coop|REMA1000|FOETEX|føtex|Bilka|Netto|NETTO|EUROSPAR|SPAR KASTETVEJ|MENY|LIDL|HJEM-IS|COOP365|LOEVBJERG|Guldbageren|Rohde & Schwarz/) ? 2001
                          : description.match(/JEM & FIX|jem&fix|Harald Nyborg|BAUHAUS|SILVAN|Plantorama|Billigblomst|Biltema/) ? 8040
                          : description.match(/NETFLIX.COM|Spotify/) ? 2032
                          : description.match(/ADM.SERVICE FYN/) ? 2171
                          : description.match(/UNO-X/) ? 2011
                          : description.match(/H: Indskud/) ? 60101
                          : description.match(/Overført fra Morten/) ? 60102
                          : null;

            transactions.set(id, {
                id,
                date: getText('reconciliation-item-date'),
                description: description,
                amount: getText('reconciliation-item-amount'),
                account: account
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
    const hitRate = result.filter(x => x.account !== null).length;

    console.table(result);
    console.log(`Extracted ${result.length} transactions, account hits ${hitRate}`);
    return result;


})();