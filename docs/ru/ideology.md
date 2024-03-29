---
title: Идеология
en: ../en/ideology.md
---

Решения, примененные в Latid, продиктованы не только техническими
и эстетическими соображениями.

Партизанский интернет
---------------------

Latid приспособлен для работы "под давлением". К сожалению, мы живем в 
мире, где свобода высказывания постоянно подвергается ограничениям. Сайты 
блокируются, государствами или иными агентами, создатели контента подвергаются
преследованиям или *отмене.* Итак, что нужно веб-партизану от генератора 
статичных сайтов?

### Скрыть, как будто не было

Ваш сайт, и все, что нужно для его функционирования, хранится в одной директории.
Вы можете спрятать ее и отрицать сам факт существования сайта. На вашем 
компьютере не требуется установка каких-либо специфических библиотек или модулей,
кроме node.js, присутствие которого можно легко оправдать.

### Быстро сменить рабочий компьютер

Всего одна директория с исходными файлами, и одна зависимость.

### Легко поменять хостинг

Это облегчается использованием в Latid относительных ссылок. Вы можете выложить 
сайт на отдельный домен, потом переместить на домен второго уровня, и даже в
поддиректорию на сайте соратника, и все будет работать без дополнительных 
настроек.

### Легко добавить другие каналы коммуникации

Относительные ссылки облегчают перенос сайта в Dark Web. В конце концов, его
можно просто заархивировать и послать по электронной почте. Исходные файлы в
блочном формате — это просто JSON, который можно легко использовать для разных
способов отображения.
 
### Для любых нелегальных нужд

Вам, как партизану интернета, может понадобится открыть блог на какую-нибудь
запретную тему. Или собрать коллекцию документов, или разместить вербовочный
лендинг. Или нужно сочетать в одном сайте блог и документацию. Или... Я не 
знаю, и это не мое дело. Чтобы все это было возможно, Latid не накладывает 
никаких ограничений на структуру сайта.

А если вы не определились, и ожидаете, что в будущем вам может понадобится 
изменять структуру сайта, используйте "плюс-ссылки" и ссылочная структура сайта
будет сохранена, даже если вы поменяете расположение страниц.

