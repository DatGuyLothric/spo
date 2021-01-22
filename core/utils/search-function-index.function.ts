export function searchFunIndex(name, func) {
    for (let i = 0; i < func.length; i++)
        if (func[i][0] === name)
            return i;
    return -1;
}
