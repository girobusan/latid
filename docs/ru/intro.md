---
title: Что такое Latid
---


Latid — генератор статических сайтов, который работает как утилита командной строки,
а также через GUI в браузере (позволяет использовать блочный редактор).

Он идеален для многостраничных сайтов (проверено с сайтами с более чем 2000 страниц) со статическим
(необязательно) контентом (блогов, документации, портфолио).

## Возможности

- Одна зависимость (node.js), не требует инсталляции (просто положите файлы куда надо)
- Максимально простое управление контентом
- Основной формат исходных файлов — JSON, максимально семантический, можно использовать с разными фронтендами
- Можно использовать markdown в качестве исходных файлов
- GUI, в браузере
- Работает как утилита командной строки
- Работает в Jamstack
- Шаблонизатор Nunjucks со всеми плюшками
- Поддержка меток, генерируемые на лету и постоянные страницы для меток
- Относительные ссылки, простая смена URL страниц, сайт можно просматривать с локального диска не используя сервер
- Многоязычность и уникод
- Произвольная структура сайта

![screenshot](pix/readme_cover.png) 

## Требования

Нужен node.js, версия 11 или старше.

Сайты, созданные с помощью Latid могут боль полностью статичны и совместимы с самыми
древними браузерами (и текстовыми), но для использования GUI для редактирования
вам понадобится современный браузер. Можно обойтись без GUI, с некоторыми ограничениями.

Проверены: Firefox, версия>68, Chrome, >77. Safari >12 тоже может сработать. 
