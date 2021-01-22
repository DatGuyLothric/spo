export enum LexemTypeEnum {
    VAR                     = '^([A-z]+)$',
    DIGIT                   = '^(0|[1-9][0-9]*)$',
    RP                      = '^\\)$',
    LP                      = '^\\($',
    OP                      = '^(\\+|-|\\*|\\/)$',
    ASSIGN_OP               = '^=$',
    COMPARISON_OP           = '^(==|!=|>|<|>=|<=)$',
    RB                      = '^\\}$',
    LB                      = '^\\{$',
    IF                      = '^if$',
    ELSE                    = '^else$',
    WHILE                   = '^while$',
    PRINT                   = '^print$',
    FUNCTION                = '^function$',
    RETURN                  = '^return$',
    COMMA                   = '^,$',
    EOE                     = '^;$',

    GOTO_ON_FALSE           = '^_______________$',
    GOTO_POINT              = '^_______________$',
    FUNC_NAME               = '^_______________$',
    END                     = '^_______________$',
    CONST                   = '^_______________$',
    TR                      = '^_______________$',
    FUNC_VALUE              = '^_______________$',
}

export type LexemType = (keyof typeof LexemTypeEnum) | '';
