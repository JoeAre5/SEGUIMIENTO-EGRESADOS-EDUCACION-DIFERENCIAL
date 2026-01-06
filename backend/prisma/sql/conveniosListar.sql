SELECT
    c."idConvenio" as "idConvenio",
    c."urlFoto" as "imagen",
    c."titulo" as "nombreConvenio",
    c."centroPractica" as "centroPractica",
    c."fechaInicioConvenio" as "inicio",
    m."nombreModalidad" as "nombreModalidad"
FROM "Convenio" c
         JOIN "Modalidad" m ON (c."idModalidad" = m."idModalidad")
WHERE c."validez" = true

-- MIGRADO A NUEVO MODELO


/*
SELECT
    c."id" as "idConvenio",
    c."urlFoto" as "imagen",
    c."titulo" as "nombreConvenio",
    c."centroPractica" as "centroPractica",
    c."fechaInicioConvenio" as "inicio",
    m."nombreModalidad" as "nombreModalidad"
FROM "Convenio" c
         JOIN "Modalidad" m ON (c."idModalidad" = m."id")
WHERE c."validez" = true

--VERSION ANTIGUO ESQUEMA


*/