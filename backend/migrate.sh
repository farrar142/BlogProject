python3 manage.py makemigrations
python3 manage.py migrate

article
//db 배열
id del reg upd tit cont sta blog user

//sql문 배열

id title context  reg update user_id blog_id status deleted

blog
//db
id deleted status reg update  name user

//sql문
id name reg update user deleted status


ALTER TABLE blog.blog_blog CHANGE name name varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL AFTER id;
ALTER TABLE blog.blog_blog CHANGE deleted_at deleted_at datetime(6) DEFAULT NULL NULL AFTER user_id;
ALTER TABLE blog.blog_blog CHANGE status status int(10) unsigned NOT NULL AFTER deleted_at;

ALTER TABLE blog.blog_blog CHANGE status status int(10) unsigned NOT NULL AFTER deleted_at;
ALTER TABLE blog.blog_blog CHANGE deleted_at deleted_at datetime(6) DEFAULT NULL NULL AFTER id;
ALTER TABLE blog.blog_blog CHANGE reg_date reg_date datetime(6) NOT NULL AFTER status;
ALTER TABLE blog.blog_blog CHANGE update_date update_date datetime(6) DEFAULT NULL NULL AFTER reg_date;
