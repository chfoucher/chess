CREATE TABLE moves (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    origRow INT UNSIGNED,
    origColumn INT UNSIGNED,
    origType CHAR(1),
    origColour CHAR(1),
    destRow INT UNSIGNED,
    destColumn INT UNSIGNED,
    destType CHAR(1),
    destColour CHAR(1)
);
