const get_default_month = () => {
    const today = new Date();
    const future_month_index = (today.getMonth() + 2) % 12;
    const month_names = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];
    return month_names[future_month_index];
}

const cleanText = (str) =>
        str.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');

export { get_default_month, cleanText };