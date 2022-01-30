export default {
    sortArray (array, sortBy) {
        function compare(a, b) {
            if (a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) return -1;
            if (a[sortBy].toLowerCase() > b[sortBy].toLowerCase()) return 1;
        }
        return array.sort(compare);
    },
    sortArrayNum(array, sortBy) {
        function compare(a, b) {
            if (a[sortBy] < b[sortBy]) return -1;
            if (a[sortBy] > b[sortBy]) return 1;
        }
        return array.sort(compare);
    },
    simpleSort(array) {
        function compare(a, b) {
            if (a.toLowerCase() < b.toLowerCase()) return -1;
            if (a.toLowerCase() > b.toLowerCase()) return 1;
        }
        return array.sort(compare);
    },
    shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }
}