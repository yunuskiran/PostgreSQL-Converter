//TABLE,VIEW,SEQUENCE etc...
export const tableExpression = /^CREATE TABLE \[(.*)\]\.\[(.*)\]\s*\(/;
export const columnExpression = /^\t\[(.*)\] (?:\[(.*)\]\.)?\[(.*)\]\s*(\(.+?\))?(?: COLLATE (\S+))?( IDENTITY\s*\(\d+,\s*\d+\))?(?: ROWGUIDCOL ?)? (?:NOT FOR REPLICATION )?(?:SPARSE +)?(NOT NULL|NULL)(?:\s+CONSTRAINT \[.*\])?(?:\s+DEFAULT \((.*)\))?(?:,|$)?/;
export const columnQualExpression = /\((\d+(?:,\s*\d+)?)\)/;
export const computedColumnExpression = /^\t\[(.*)\]\s+AS\s+\((.*)\)/;
export const constrainExpression = /^(?: CONSTRAINT \[(.*)\] )?PRIMARY KEY (?:NON)?CLUSTERED/;
export const constraintColumnExpression = /^\t\[(.*)\] (ASC|DESC)(,?)/;
export const uniqueConstraintExpression = /^\s*(?:CONSTRAINT \[(.*)\] )?UNIQUE/;
export const sequenceExpression = /^CREATE SEQUENCE \[(.*)\]\.\[(.*)\]/;
export const schemaExpression = /^CREATE SCHEMA \[(.*)\]/;
export const viewExpression = /^\s*(create\s*view)/i;