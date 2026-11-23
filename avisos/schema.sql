-- Base D1 «scaeli-avisos» (id 5d23d505-756a-436b-83ef-8efa17527345), creada el 23/11/2026.
-- subs: un dispositivo (token de FCM) por fila. horas: sus recordatorios; hl = hora local elegida, hm = la misma en UTC.
-- avisados: mensajes del grupo ya avisados (para no repetir), se borran a los 2 días.
CREATE TABLE IF NOT EXISTS subs (token TEXT PRIMARY KEY, uid TEXT NOT NULL, tz TEXT NOT NULL DEFAULT 'America/Argentina/Buenos_Aires', gr INTEGER NOT NULL DEFAULT 1, bloq TEXT NOT NULL DEFAULT '[]', plat TEXT NOT NULL DEFAULT 'web', act INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS subs_uid ON subs(uid);
CREATE TABLE IF NOT EXISTS horas (token TEXT NOT NULL, k TEXT NOT NULL, hl TEXT NOT NULL, hm TEXT NOT NULL, PRIMARY KEY (token, k));
CREATE INDEX IF NOT EXISTS horas_hm ON horas(hm);
CREATE TABLE IF NOT EXISTS avisados (mid TEXT PRIMARY KEY, t INTEGER NOT NULL);
