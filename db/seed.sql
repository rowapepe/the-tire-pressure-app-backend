-- Тестовые данные. Выполнить в DBeaver (SQL-запрос) после применения миграции.
-- Пользователь с id = 1 — «текущий» пользователь приложения (константа CURRENT_USER_ID).

INSERT INTO users (id, login) VALUES
	(1, 'admin'),
	(2, 'driver_ivan'),
	(3, 'driver_anna');

-- Услуги: опубликованные (1-3), черновик (4), удалённая (5).
-- У черновика ссылки на фото и видео пустые, поэтому отображаются файлы по умолчанию.
INSERT INTO tire_types (id, title, description, status, image_url, video_url, season, optimal_pressure, radius, created_at, formed_at, creator_id) VALUES
	(1, 'Michelin Pilot Sport 4',
		'Летняя шина премиум-класса для спортивных автомобилей. Отличное сцепление на сухом и мокром асфальте, точная управляемость и короткий тормозной путь на высоких скоростях.',
		'published', 'http://localhost:9000/media/michelin-pilot-sport.jpg', 'http://localhost:9000/media/michelin-pilot-sport.mov',
		'летняя', 2.3, 18, now() - interval '3 days', now() - interval '2 days', 1),
	(2, 'Nokian Hakkapeliitta 10',
		'Зимняя шипованная шина для суровых условий. Уверенно держит дорогу на льду и укатанном снегу, обеспечивает надёжное торможение и устойчивость при морозе до -40 °C.',
		'published', 'http://localhost:9000/media/nokian-hakka.jpg', 'http://localhost:9000/media/nokian-hakka.MP4',
		'зимняя', 2.1, 17, now() - interval '3 days', now() - interval '2 days', 2),
	(3, 'Continental AllSeasonContact',
		'Всесезонная шина для смешанных условий. Подходит для эксплуатации круглый год в умеренном климате, сохраняет эластичность в прохладную погоду и не требует сезонной переобувки.',
		'published', 'http://localhost:9000/media/continental-allseason.jpg', 'http://localhost:9000/media/continental-allseason.mov',
		'всесезонная', 2.2, 16, now() - interval '3 days', now() - interval '1 day', 3),
	(4, 'Nokian Hakkapeliitta 9', NULL,
		'draft', NULL, NULL,
		NULL, NULL, NULL, now(), NULL, 1),
	(5, 'Bridgestone Turanza T005',
		'Летняя комфортная шина с низким уровнем шума и хорошей управляемостью. Хорошо гасит неровности дороги и снижает утомляемость водителя в дальних поездках.',
		'deleted', 'http://localhost:9000/media/bridgestone-turanza.jpg', 'http://localhost:9000/media/bridgestone-turanza.mov',
		'летняя', 2.3, 17, now() - interval '5 days', now() - interval '4 days', 2);

INSERT INTO tire_type_likes (user_id, tire_type_id) VALUES
	(1, 1), (2, 1),
	(1, 2),
	(1, 3), (2, 3), (3, 3);

-- Сдвигаем счётчики serial после вставки с явными id
SELECT setval('users_id_seq', (SELECT max(id) FROM users));
SELECT setval('tire_types_id_seq', (SELECT max(id) FROM tire_types));
SELECT setval('tire_type_likes_id_seq', (SELECT max(id) FROM tire_type_likes));
