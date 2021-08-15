# lireddit-tutorial
From the Ben Awad fullstack tutorial https://www.youtube.com/watch?v=I6ypD7qv3Z8&amp;list=PLWLaxRA0v4KDUi3kxFgTdt5193TT2ftYj&amp;index=10&amp;t=14356s

### To start server:

- `cd server && yarn start`

#### To start watch-mode

- `cd server && yarn watch`

### To start web:

- `cd web && yarn dev`



#### Creating a new database migration:

- `cd server && npx typeorm migration:create -n NameOfMigration` 

`public async up(queryRunner: QueryRunner): Promise<Void>{}` handles updating the DB, and `down` handles rolling-back if needed. 

Add `await queryRunner.query(``)` to your `up` function and paste in the SQL that you want run.



*Make sure connection.runMigrations() is uncommented when you reload your web page*




