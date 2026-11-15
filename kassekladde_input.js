
(async () => {
    if (!Array.isArray(result) || !result.length) {
        throw new Error('result is missing or empty');
    }

    const table = [...document.querySelectorAll('ledger-table')]
        .find(el => el.querySelector(
            '.ledger-table-item-row--cell__date--field'
        ));
    
    if (!table) {
        throw new Error('Ledger table not found');
    }

    if (!table) {
        throw new Error('Ledger table not found');
    }

    const wait = ms =>
        new Promise(resolve => setTimeout(resolve, ms));

    const getRows = () =>
        [...table.querySelectorAll('ledger-table-item')];

    function setValue(input, value) {
        const setter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value'
        ).set;

        setter.call(input, String(value ?? ''));

        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true }));

    }

    async function waitForRows(count) {
        for (let attempt = 0; attempt < 50; attempt++) {
            if (getRows().length >= count) return;
            await wait(100);
        }

        throw new Error('Timed out waiting for next placeholder row');
    }

    console.log(`Starting: ${result.length} transactions`);

    for (let i = 0; i < result.length; i++) {
        let rows = getRows();

        if (!rows[i]) {
            throw new Error(`Row ${i} not found`);
        }

        const row = rows[i];

        const date = row.querySelector(
            '.ledger-table-item-row--cell__date--field'
        );

        const description = row.querySelector(
            '.ledger-table-item-line--cell__description--field'
        );

        const amount = row.querySelector(
            '.ledger-table-item-line--cell__amount--field'
        );

        if (!date || !description || !amount) {
            throw new Error(`Missing input field in row ${i}`);
        }

        const transaction = result[i];

        setValue(date, transaction.date);
        setValue(description, transaction.description);
        setValue(amount, transaction.amount);

        console.log(`Entered ${i + 1}/${result.length}`, transaction);

        await wait(400);

        amount.focus();
        amount.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'ArrowDown',
            code: 'ArrowDown',
            keyCode: 40,
            which: 40,
            bubbles: true
        }));
        
        await wait(400);
        // Wait for Dinero to append the next placeholder row.
        if (i < result.length - 1) {
            await waitForRows(i + 2);
        }
        await wait(400);
    }

    console.log('Finished entering transactions');
})();
