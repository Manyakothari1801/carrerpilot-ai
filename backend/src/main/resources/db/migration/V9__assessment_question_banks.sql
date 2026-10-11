CREATE TABLE assessment_attempt_questions (
    id UUID PRIMARY KEY,
    attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE RESTRICT,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uk_attempt_selected_question UNIQUE (attempt_id, question_id),
    CONSTRAINT uk_attempt_selected_order UNIQUE (attempt_id, question_order)
);
CREATE INDEX idx_attempt_questions_attempt ON assessment_attempt_questions(attempt_id, question_order);

UPDATE assessments SET total_questions=10,updated_at=CURRENT_TIMESTAMP
WHERE id IN ('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000003');

CREATE TEMP TABLE phase6_question_seed(
 id UUID,assessment_id UUID,question_order INTEGER,question_text VARCHAR(1000),explanation VARCHAR(1500),difficulty VARCHAR(20),skill_tag VARCHAR(120),correct_key VARCHAR(10),option_a VARCHAR(500),option_b VARCHAR(500),option_c VARCHAR(500),option_d VARCHAR(500)
) ON COMMIT DROP;

INSERT INTO phase6_question_seed VALUES
('14000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001',4,'What is the value of an uninitialized instance field of type int?','Java initializes an instance int field to zero.','EASY','Java Fundamentals','B','null','0','-1','Undefined'),
('14000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001',5,'Which statement about method overloading is correct?','Overloaded methods share a name but have different parameter lists.','MEDIUM','Polymorphism','C','It requires inheritance','It changes only the return type','It uses different parameter lists','It occurs only at runtime'),
('14000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000001',6,'What does the final keyword prevent when applied to a class?','A final class cannot be extended.','EASY','Inheritance','A','The class from being extended','Objects from being created','Methods from being called','Fields from being initialized'),
('14000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000001',7,'Which statement best distinguishes an interface from an abstract class?','A class can implement multiple interfaces but extend only one class.','MEDIUM','Interfaces','D','Interfaces always contain state','Abstract classes cannot have constructors','Interfaces can be instantiated directly','A class can implement multiple interfaces'),
('14000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000001',8,'Which exception type must normally be declared or caught?','Checked exceptions are enforced by the compiler.','MEDIUM','Exceptions','B','RuntimeException','A checked exception','Error','NullPointerException'),
('14000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000001',9,'Why is String considered immutable in Java?','Operations that appear to modify a String produce a new String object.','EASY','Strings','C','Its characters are always stored on the stack','It cannot be compared','Its value cannot change after construction','It has no methods'),
('14000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000001',10,'Which component executes Java bytecode?','The JVM loads and executes Java bytecode.','EASY','JVM JDK JRE','A','JVM','JDK compiler only','Source editor','Maven'),
('14000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000001',11,'What benefit do Java generics primarily provide?','Generics provide compile-time type safety and reduce explicit casts.','MEDIUM','Generics','D','Automatic synchronization','Faster network access','Runtime code generation','Compile-time type safety'),
('14000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000001',12,'Which collection maps unique keys to values?','Map associates each unique key with a value.','EASY','Collections','B','List','Map','Queue','Deque'),
('14000000-0000-0000-0000-000000000013','10000000-0000-0000-0000-000000000001',13,'What is the purpose of the synchronized keyword?','It controls concurrent access to a critical section or monitor.','MEDIUM','Concurrency','C','It creates a new process','It makes a field immutable','It coordinates access between threads','It guarantees faster execution'),
('14000000-0000-0000-0000-000000000014','10000000-0000-0000-0000-000000000001',14,'Which access modifier limits a member to its declaring class?','A private member is accessible only within its declaring class.','EASY','Java Fundamentals','A','private','protected','public','package'),
('14000000-0000-0000-0000-000000000015','10000000-0000-0000-0000-000000000001',15,'Which method is used for content equality between Java objects?','The equals method represents logical equality when implemented appropriately.','EASY','OOP','D','clone','hashCode only','toString','equals'),

('15000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000002',4,'Which HTTP status code indicates successful resource creation?','HTTP 201 Created indicates that a resource was successfully created.','EASY','HTTP','B','200','201','204','304'),
('15000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000002',5,'Which HTTP method is intended for retrieving a resource without changing it?','GET is the standard safe method for resource retrieval.','EASY','REST APIs','A','GET','POST','PATCH','DELETE'),
('15000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000002',6,'What is dependency injection used for in Spring?','Dependency injection supplies collaborators externally and reduces tight coupling.','MEDIUM','Dependency Injection','C','To encrypt database rows','To compile JavaScript','To supply object dependencies','To replace HTTP'),
('15000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000002',7,'Which Spring stereotype is most appropriate for business logic?','@Service identifies a business-service component.','EASY','Spring Boot','D','@Entity','@RestController','@Repository','@Service'),
('15000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000002',8,'What does a Spring Data JPA repository primarily provide?','It provides a data-access abstraction with common persistence operations.','MEDIUM','JPA Hibernate','B','Browser rendering','Persistence operations','JWT creation only','Container orchestration'),
('15000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000002',9,'Which SQL clause filters rows before grouping?','WHERE filters source rows before GROUP BY is evaluated.','MEDIUM','SQL PostgreSQL','A','WHERE','HAVING','ORDER BY','RETURNING'),
('15000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000002',10,'What does transaction rollback do?','Rollback discards the uncommitted changes in the transaction.','EASY','Transactions','C','Publishes an API','Creates an index','Discards uncommitted changes','Restarts the server'),
('15000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000002',11,'What is the primary purpose of authentication?','Authentication verifies the identity of a user or service.','EASY','Authentication','D','Compress responses','Assign database indexes','Choose UI colors','Verify identity'),
('15000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000002',12,'Which statement describes a microservice?','A microservice is an independently deployable service aligned to a focused capability.','MEDIUM','Microservices','B','A database table','An independently deployable focused service','A CSS component','A single method'),
('15000000-0000-0000-0000-000000000013','10000000-0000-0000-0000-000000000002',13,'Where should request validation normally occur in a Spring REST API?','Validation belongs at the API boundary using validated request DTOs and constraints.','MEDIUM','API Validation','A','At the request DTO boundary','Only in frontend CSS','Inside database backups','After returning the response'),
('15000000-0000-0000-0000-000000000014','10000000-0000-0000-0000-000000000002',14,'What is a benefit of centralized API exception handling?','It produces consistent status codes and response structures.','MEDIUM','Error Handling','C','It exposes stack traces','It removes validation','It creates consistent error responses','It disables security'),
('15000000-0000-0000-0000-000000000015','10000000-0000-0000-0000-000000000002',15,'Which database index is most useful for frequent equality lookups on a column?','A B-tree index is the common default for equality and range lookups in PostgreSQL.','HARD','PostgreSQL','D','No index','A CSS index','A log file','A B-tree index'),

('16000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000003',4,'A price increases from 80 to 100. What is the percentage increase?','The increase is 20, and 20 divided by 80 is 25 percent.','MEDIUM','Percentages','C','20%','22.5%','25%','30%'),
('16000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000003',5,'A ratio is 2:3 and the total is 30. What is the smaller part?','There are five ratio parts; each is 6, so the smaller part is 12.','EASY','Ratios','B','10','12','15','18'),
('16000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000003',6,'What is the average of 8, 10, 12, and 14?','Their sum is 44 and 44 divided by 4 is 11.','EASY','Averages','A','11','10','12','13'),
('16000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000003',7,'An item costs 500 and sells for 600. What is the profit percentage on cost?','Profit is 100; 100 divided by 500 is 20 percent.','MEDIUM','Profit and Loss','D','10%','15%','25%','20%'),
('16000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000003',8,'If one worker completes a task in 6 days, what fraction is completed in one day?','At a constant rate, one sixth of the task is completed per day.','EASY','Time and Work','B','1/3','1/6','1/8','6'),
('16000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000003',9,'A car travels 150 km in 3 hours. What is its average speed?','Average speed is distance divided by time: 150 divided by 3 equals 50 km/h.','EASY','Speed Distance Time','C','45 km/h','55 km/h','50 km/h','60 km/h'),
('16000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000003',10,'Complete the series: 3, 6, 12, 24, ?','Each term doubles, so the next term is 48.','EASY','Number Series','A','48','36','42','54'),
('16000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000003',11,'What is the probability of rolling an even number on a fair six-sided die?','Three of six outcomes are even, giving a probability of one half.','MEDIUM','Probability','D','1/6','1/3','2/3','1/2'),
('16000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000003',12,'All pens are tools. Some tools are blue. Which conclusion is guaranteed?','Only the stated inclusion that every pen is a tool is guaranteed.','MEDIUM','Logical Reasoning','B','All pens are blue','Every pen is a tool','All tools are pens','No tool is blue'),
('16000000-0000-0000-0000-000000000013','10000000-0000-0000-0000-000000000003',13,'If 4 notebooks cost 120, what do 7 notebooks cost at the same rate?','Each notebook costs 30, so seven cost 210.','EASY','Quantitative Reasoning','C','180','200','210','240'),
('16000000-0000-0000-0000-000000000014','10000000-0000-0000-0000-000000000003',14,'A number is increased by 20 percent and becomes 240. What was the original number?','The original multiplied by 1.2 is 240, so it was 200.','MEDIUM','Percentages','A','200','192','220','288'),
('16000000-0000-0000-0000-000000000015','10000000-0000-0000-0000-000000000003',15,'Two fair coins are tossed. What is the probability of exactly one head?','HT and TH are two of four equally likely outcomes, so the probability is one half.','MEDIUM','Probability','D','1/4','3/4','1/3','1/2');

INSERT INTO assessment_questions(id,assessment_id,question_order,question_type,question_text,explanation,difficulty,skill_tag,created_at)
SELECT id,assessment_id,question_order,'MCQ',question_text,explanation,difficulty,skill_tag,CURRENT_TIMESTAMP FROM phase6_question_seed
ON CONFLICT (id) DO NOTHING;

INSERT INTO assessment_options(id,question_id,option_key,option_text,is_correct,created_at)
SELECT (substr(md5(s.id::text||o.key),1,8)||'-'||substr(md5(s.id::text||o.key),9,4)||'-'||substr(md5(s.id::text||o.key),13,4)||'-'||substr(md5(s.id::text||o.key),17,4)||'-'||substr(md5(s.id::text||o.key),21,12))::uuid,
       s.id,o.key,o.text,o.key=s.correct_key,CURRENT_TIMESTAMP
FROM phase6_question_seed s
CROSS JOIN LATERAL (VALUES ('A',s.option_a),('B',s.option_b),('C',s.option_c),('D',s.option_d)) AS o(key,text)
ON CONFLICT (question_id,option_key) DO NOTHING;
