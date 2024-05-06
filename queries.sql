-- Создана заполнена
CREATE TABLE users(
    id serial primary key,
    email varchar(100) unique not null,
    password varchar(60) not null,
    username varchar(256) not null
);

-- Создана заполнена
CREATE TABLE refresh_sessions(
    id serial primary key,
    user_id int not null references users(id) on delete cascade,
    refresh_token varchar(400) not null,
    finger_print varchar(32) not null
);

-- Создана, заполнена
CREATE TABLE specs(
    id serial primary key,
    name varchar(512) NOT NULL,
    code varchar(20) NOT NULL
);

-- Создана, заполнена
CREATE TABLE levels(
    id serial primary key,
    name varchar(20) NOT NULL
);

-- Создана, заполнена
CREATE TABLE groups(
    id serial primary key,
    level_id INT NOT NULL references levels(id) on delete cascade,
    spec_id INT NOT NULL references specs(id) on delete cascade,
    course INT NOT NULL,
    number VARCHAR(10) NOT NULL
);

-- Создана, заполнена
CREATE TABLE lesson_types(
    id serial primary key,
    name VARCHAR(100) NOT NULL
);

-- Создана
CREATE TABLE events(
    id serial primary key,
    group_id INT NOT NULL references groups(id) on delete cascade,
    lesson_type_id INT NOT NULL references lesson_types(id) on delete cascade,
    user_id INT NOT NULL references users(id) on delete cascade,
    discipline_id INT NOT NULL references disciplines(id) on delete cascade,
    start_datetime INT NOT NULL,
    end_datetime INT NOT NULL,
    room VARCHAR(10),
    description VARCHAR(512)
);

-- Создана, заполнена
CREATE TABLE students(
    id serial primary key,
    group_id INT NOT NULL references groups(id) on delete cascade,
    name VARCHAR(256) NOT NULL,
    elder SMALLINT
);

-- Создана
CREATE TABLE disciplines(
    id serial primary key,
    name VARCHAR(256) NOT NULL
);

-- Создана
CREATE TABLE marks(
    id serial primary key,
    student_id INT NOT NULL references students(id) on delete cascade,
    discipline_id INT NOT NULL references disciplines(id) on delete cascade,
    event_id INT NOT NULL references events(id) on delete cascade,
    mark VARCHAR(3),
    note VARCHAR(128)
);



select * from users;
select * from refresh_sessions;