export function operation(e1, e2, op) {
    switch (op) {
        case '-':
            return { lexem: 'DIGIT', value: Number(e1) - Number(e2) };
        case '+':
            return { lexem: 'DIGIT', value: Number(e1) + Number(e2) };
        case '*':
            return { lexem: 'DIGIT', value: Number(e1) * Number(e2) };
        case '/':
            return { lexem: 'DIGIT', value: Math.round(Number(e1) / Number(e2)) };
        case '==':
            return { lexem: 'DIGIT', value: Number(e1) == Number(e2) };
        case '!=':
            return { lexem: 'DIGIT', value: Number(e1) != Number(e2) };
        case '>':
            return { lexem: 'DIGIT', value: Number(e1) > Number(e2) };
        case '<':
            return { lexem: 'DIGIT', value: Number(e1) < Number(e2) };
    }
}
