export function findValue(name, values, fl = true) {
    for (let i = 0; i < values.length; i++) {
        if (name === values[i][0])
            return fl ? values[i][values[i].length - 1] : i;
    }
    return null;
}