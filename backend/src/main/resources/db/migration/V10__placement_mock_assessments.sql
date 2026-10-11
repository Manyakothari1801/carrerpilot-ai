ALTER TABLE assessments ADD COLUMN catalog_group VARCHAR(30) NOT NULL DEFAULT 'PRACTICE';
ALTER TABLE assessment_questions ADD COLUMN selection_category VARCHAR(40);

INSERT INTO assessments(id,title,description,assessment_type,target_role,difficulty,duration_minutes,total_questions,passing_percentage,generation_source,generation_model,created_by,active,created_at,updated_at,catalog_group) VALUES
('20000000-0000-0000-0000-000000000001','Placement Aptitude Mock Test','Calculation, reasoning, and verbal questions modeled on common fresher placement screens.','APTITUDE_MCQ',NULL,'MEDIUM',20,10,60,'SEED',NULL,NULL,TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'PLACEMENT_MOCK'),
('20000000-0000-0000-0000-000000000002','Technical Screening Mock Test','Programming, CS fundamentals, SQL, and DSA questions for an initial technical screen.','TECHNICAL_MCQ','Software Engineer','MEDIUM',25,10,67,'SEED',NULL,NULL,TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'PLACEMENT_MOCK'),
('20000000-0000-0000-0000-000000000003','Coding & DSA Screening','MCQ-based algorithm selection, complexity, debugging, and data-structure practice.','TECHNICAL_MCQ','Software Engineer','MEDIUM',25,10,67,'SEED',NULL,NULL,TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'PLACEMENT_MOCK'),
('20000000-0000-0000-0000-000000000004','Backend Developer Hiring Test','Scenario-focused Java, Spring, REST, SQL, Git, Docker, and backend screening.','ROLE_BASED_MCQ','Backend Developer','MEDIUM',25,10,67,'SEED',NULL,NULL,TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'PLACEMENT_MOCK'),
('20000000-0000-0000-0000-000000000005','Full Company Placement Mock Test','A balanced simulation of a general software-company initial placement screening.','ROLE_BASED_MCQ','Software Engineer','HARD',30,20,60,'SEED',NULL,NULL,TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'PLACEMENT_MOCK');

CREATE TEMP TABLE mock_seed(assessment_id UUID,question_order INT,selection_category VARCHAR(40),difficulty VARCHAR(20),skill_tag VARCHAR(120),question_text VARCHAR(1000),explanation VARCHAR(1500),correct_key VARCHAR(10),option_a VARCHAR(500),option_b VARCHAR(500),option_c VARCHAR(500),option_d VARCHAR(500)) ON COMMIT DROP;

INSERT INTO mock_seed VALUES
('20000000-0000-0000-0000-000000000001',1,'APTITUDE','EASY','Percentages','A salary of 40,000 increases by 12%. What is the new salary?','Twelve percent of 40,000 is 4,800, giving 44,800.','C','42,400','43,200','44,800','45,200'),
('20000000-0000-0000-0000-000000000001',2,'APTITUDE','MEDIUM','Percentages','After a 20% discount, a bag costs 1,200. What was its marked price?','The sale price is 80% of marked price, so 1,200 / 0.8 = 1,500.','B','1,440','1,500','1,600','1,800'),
('20000000-0000-0000-0000-000000000001',3,'APTITUDE','MEDIUM','Profit and Loss','A laptop bought for 48,000 is sold at a 15% profit. What is the selling price?','The profit is 7,200, so the selling price is 55,200.','D','50,400','52,800','54,000','55,200'),
('20000000-0000-0000-0000-000000000001',4,'APTITUDE','HARD','Profit and Loss','An item is marked 25% above cost and discounted by 10%. What is the profit percentage?','1.25 times cost followed by 0.9 gives 1.125 times cost, or 12.5% profit.','A','12.5%','15%','17.5%','22.5%'),
('20000000-0000-0000-0000-000000000001',5,'APTITUDE','EASY','Ratio and Proportion','Developers and testers are in the ratio 5:3. If there are 24 testers, how many developers are there?','Each ratio unit is 8, so developers total 5 times 8 = 40.','C','32','36','40','45'),
('20000000-0000-0000-0000-000000000001',6,'APTITUDE','MEDIUM','Ratio and Proportion','Divide 840 in the ratio 2:5. What is the larger share?','Seven parts equal 840, so one part is 120 and the larger share is 600.','D','240','480','560','600'),
('20000000-0000-0000-0000-000000000001',7,'APTITUDE','MEDIUM','Time and Work','A completes a task in 12 days and B in 18 days. How long together?','Their daily rate is 1/12 + 1/18 = 5/36, so time is 36/5 = 7.2 days.','B','6 days','7.2 days','8 days','9 days'),
('20000000-0000-0000-0000-000000000001',8,'APTITUDE','HARD','Time and Work','Six workers finish a job in 15 days. At the same rate, how many days do ten workers need?','The job requires 90 worker-days; divided among ten workers it takes 9 days.','C','6','7.5','9','10'),
('20000000-0000-0000-0000-000000000001',9,'APTITUDE','EASY','Speed Distance Time','A train covers 240 km at 60 km/h. How long does it take?','Time is distance divided by speed: 240 / 60 = 4 hours.','A','4 hours','5 hours','6 hours','3 hours'),
('20000000-0000-0000-0000-000000000001',10,'APTITUDE','MEDIUM','Speed Distance Time','A car travels 120 km at 40 km/h and returns at 60 km/h. What is its average speed for the trip?','For equal distances, average speed is 2ab/(a+b) = 48 km/h.','C','45 km/h','50 km/h','48 km/h','52 km/h'),
('20000000-0000-0000-0000-000000000001',11,'APTITUDE','EASY','Probability','A box has 3 red and 7 blue balls. What is the probability of drawing red?','There are 3 favorable outcomes among 10 balls.','B','1/7','3/10','7/10','1/3'),
('20000000-0000-0000-0000-000000000001',12,'APTITUDE','MEDIUM','Probability','Two fair dice are rolled. What is the probability their sum is 7?','Six of the 36 ordered outcomes sum to 7, so the probability is 1/6.','D','1/12','1/9','5/36','1/6'),
('20000000-0000-0000-0000-000000000001',13,'APTITUDE','EASY','Number Systems','What is the remainder when 257 is divided by 7?','Seven times 36 is 252, leaving remainder 5.','C','3','4','5','6'),
('20000000-0000-0000-0000-000000000001',14,'APTITUDE','MEDIUM','Number Systems','What is the least positive number divisible by 6, 8, and 15?','The LCM uses 2 cubed, 3, and 5, which equals 120.','A','120','180','240','360'),
('20000000-0000-0000-0000-000000000001',15,'APTITUDE','MEDIUM','Data Interpretation','Quarterly sales are 20, 25, 30, and 45 lakh. What percentage of annual sales occurred in Q4?','Annual sales are 120 lakh; 45/120 equals 37.5%.','B','35%','37.5%','40%','42.5%'),
('20000000-0000-0000-0000-000000000001',16,'APTITUDE','HARD','Data Interpretation','A team closed 48, 60, and 72 tickets over three weeks. By what percentage did week 3 exceed week 1?','The increase is 24 over a base of 48, which is 50%.','D','24%','33.3%','40%','50%'),
('20000000-0000-0000-0000-000000000001',17,'LOGICAL','EASY','Series and Patterns','Find the next term: 5, 11, 23, 47, ?','Each term is doubled and then increased by one, giving 95.','C','71','89','95','97'),
('20000000-0000-0000-0000-000000000001',18,'LOGICAL','MEDIUM','Series and Patterns','Find the missing term: 2, 6, 12, 20, ?, 42.','The terms are n(n+1): 1x2, 2x3, through 6x7, so the missing value is 30.','B','28','30','32','36'),
('20000000-0000-0000-0000-000000000001',19,'LOGICAL','EASY','Coding-Decoding','If CAT is coded as DBU by shifting every letter forward once, how is DOG coded?','D, O, G each shift forward to E, P, H.','A','EPH','EOG','FPH','DPI'),
('20000000-0000-0000-0000-000000000001',20,'LOGICAL','MEDIUM','Coding-Decoding','In a code, SOFTWARE becomes TPGUXBSF. Which rule is used?','Every letter is replaced by its next alphabetic letter.','D','Reverse the word','Shift alternate letters','Move each letter back one','Move each letter forward one'),
('20000000-0000-0000-0000-000000000001',21,'LOGICAL','MEDIUM','Logical Reasoning','All APIs are interfaces. Some interfaces are public. Which conclusion is certain?','Only the direct universal statement that all APIs are interfaces is guaranteed.','B','All APIs are public','All APIs are interfaces','No interface is private','Some APIs are public'),
('20000000-0000-0000-0000-000000000001',22,'LOGICAL','HARD','Logical Reasoning','Five people stand in a line. P is before Q, Q before R, and S after R. Which must be true?','The ordering constraints imply P is before R.','C','S is last','Q is first','P is before R','R is before Q'),
('20000000-0000-0000-0000-000000000001',23,'LOGICAL','EASY','Odd One Out','Which is the odd one out: 8, 27, 64, 100?','8, 27, and 64 are perfect cubes; 100 is not.','D','8','27','64','100'),
('20000000-0000-0000-0000-000000000001',24,'LOGICAL','MEDIUM','Directions','Riya walks 3 km north and 4 km east. How far is she from the start?','The displacement forms a 3-4-5 right triangle.','A','5 km','6 km','7 km','1 km'),
('20000000-0000-0000-0000-000000000001',25,'VERBAL','EASY','English','Choose the correctly spelled word.','Accommodation has two c letters and two m letters.','C','Accomodation','Acommodation','Accommodation','Accommadation'),
('20000000-0000-0000-0000-000000000001',26,'VERBAL','MEDIUM','English','Choose the sentence with correct subject-verb agreement.','The singular subject list requires the singular verb is.','B','The list of tasks are complete.','The list of tasks is complete.','The tasks list is completes.','The list of task are complete.'),
('20000000-0000-0000-0000-000000000001',27,'VERBAL','EASY','Verbal Ability','Select the word closest in meaning to concise.','Concise means brief while still clear.','D','Uncertain','Lengthy','Decorative','Brief'),
('20000000-0000-0000-0000-000000000001',28,'VERBAL','MEDIUM','Verbal Reasoning','Statement: The server is reachable only if the network is active. The server is reachable. What follows?','Reachability together with the only-if condition implies the network is active.','A','The network is active','The network is offline','The server is local','Nothing follows'),
('20000000-0000-0000-0000-000000000001',29,'APTITUDE','MEDIUM','Averages','The average of five scores is 72. If four total 280, what is the fifth score?','All five total 360; subtracting 280 gives 80.','C','72','76','80','84'),
('20000000-0000-0000-0000-000000000001',30,'LOGICAL','HARD','Calendar Reasoning','If today is Wednesday, what day is it 100 days later?','100 leaves remainder 2 when divided by 7, so Wednesday advances to Friday.','B','Thursday','Friday','Saturday','Monday'),

('20000000-0000-0000-0000-000000000002',1,'PROGRAMMING','EASY','Java','What does the Java compiler produce from a source file?','javac produces platform-neutral bytecode in a class file.','B','Native machine code','JVM bytecode','SQL','JavaScript'),
('20000000-0000-0000-0000-000000000002',2,'PROGRAMMING','MEDIUM','Java Output','What prints: int x=3; System.out.print(++x + x++);','Prefix increment makes x 4; postfix contributes 4, so the sum is 8.','C','7','9','8','10'),
('20000000-0000-0000-0000-000000000002',3,'PROGRAMMING','EASY','OOP','Which OOP principle hides internal state behind methods?','Encapsulation controls access to object state.','A','Encapsulation','Inheritance','Overloading','Recursion'),
('20000000-0000-0000-0000-000000000002',4,'PROGRAMMING','MEDIUM','OOP','A subclass provides its own implementation of an inherited method. What is this?','Replacing inherited behavior with the same signature is overriding.','D','Overloading','Abstraction','Composition','Overriding'),
('20000000-0000-0000-0000-000000000002',5,'PROGRAMMING','MEDIUM','Exceptions','Which block executes whether or not an exception is caught?','A finally block normally runs after try/catch completion.','B','throw','finally','throws','finalize'),
('20000000-0000-0000-0000-000000000002',6,'PROGRAMMING','HARD','Exceptions','What happens when a checked exception is neither caught nor declared?','The compiler rejects the code.','C','It is silently ignored','The JVM retries','Compilation fails','It becomes an Error'),
('20000000-0000-0000-0000-000000000002',7,'PROGRAMMING','EASY','Collections','Which Java collection provides FIFO removal?','Queue models first-in, first-out processing.','A','Queue','Set','Map','Stack'),
('20000000-0000-0000-0000-000000000002',8,'PROGRAMMING','MEDIUM','Collections','Why must equal objects have equal hash codes?','Hash-based collections use the contract to locate equal keys consistently.','D','To preserve insertion order','To make objects immutable','To prevent nulls','For correct hash-based lookup'),
('20000000-0000-0000-0000-000000000002',9,'PROGRAMMING','EASY','Strings','What does s.concat("x") do when s is a String?','Strings are immutable, so concat returns a new String.','B','Mutates s in place','Returns a new String','Always throws','Returns a char array'),
('20000000-0000-0000-0000-000000000002',10,'PROGRAMMING','MEDIUM','Strings','Which comparison checks String content?','equals compares logical content; == compares references.','C','== only','compare references manually','equals','hashCode only'),
('20000000-0000-0000-0000-000000000002',11,'DBMS_SQL','EASY','SQL','Which clause groups rows for aggregate calculations?','GROUP BY forms groups consumed by aggregate functions.','D','ORDER BY','WHERE','DISTINCT','GROUP BY'),
('20000000-0000-0000-0000-000000000002',12,'DBMS_SQL','MEDIUM','SQL','Which join returns only matching rows from both tables?','INNER JOIN retains rows satisfying the join predicate on both sides.','A','INNER JOIN','LEFT JOIN','FULL JOIN','CROSS JOIN'),
('20000000-0000-0000-0000-000000000002',13,'DBMS_SQL','MEDIUM','DBMS','Which normal form removes partial dependency on a composite key?','Second normal form removes partial dependencies on a candidate key.','B','1NF','2NF','3NF','BCNF only'),
('20000000-0000-0000-0000-000000000002',14,'DBMS_SQL','HARD','Transactions','Two concurrent updates overwrite one another. Which anomaly occurred?','The later write hides the earlier concurrent write, causing a lost update.','C','Dirty read','Phantom read','Lost update','Non-repeatable schema'),
('20000000-0000-0000-0000-000000000002',15,'CS_FUNDAMENTALS','EASY','Operating Systems','Which OS component chooses the next ready process to run?','The CPU scheduler selects work from the ready queue.','A','CPU scheduler','Linker','File extension','DNS resolver'),
('20000000-0000-0000-0000-000000000002',16,'CS_FUNDAMENTALS','MEDIUM','Operating Systems','What is a necessary condition for deadlock?','Circular wait is one of the four Coffman deadlock conditions.','D','Unlimited memory','One process only','No shared resources','Circular wait'),
('20000000-0000-0000-0000-000000000002',17,'CS_FUNDAMENTALS','EASY','Networks','Which protocol provides reliable ordered byte delivery?','TCP provides a reliable ordered byte stream.','B','UDP','TCP','ARP','ICMP only'),
('20000000-0000-0000-0000-000000000002',18,'CS_FUNDAMENTALS','MEDIUM','Networks','A hostname must be translated to an IP address. Which service is used?','DNS resolves domain names to address records.','C','DHCP only','FTP','DNS','SMTP'),
('20000000-0000-0000-0000-000000000002',19,'DSA','EASY','Arrays','What is random-access lookup complexity for an array index?','Address arithmetic locates an indexed array element in constant time.','A','O(1)','O(log n)','O(n)','O(n log n)'),
('20000000-0000-0000-0000-000000000002',20,'DSA','MEDIUM','Strings','Which structure efficiently detects repeated characters while scanning once?','A hash set records characters already encountered in expected linear time.','D','A recursive stack only','A database transaction','A priority queue only','A hash set'),
('20000000-0000-0000-0000-000000000002',21,'DSA','EASY','Stack','Which operation removes the most recently pushed stack item?','pop removes the top stack element.','B','enqueue','pop','peek without removal','offer'),
('20000000-0000-0000-0000-000000000002',22,'DSA','MEDIUM','Queue','Breadth-first graph traversal primarily uses which structure?','BFS processes discovered vertices in FIFO order using a queue.','C','Stack','Heap only','Queue','Hash code'),
('20000000-0000-0000-0000-000000000002',23,'DSA','MEDIUM','Hashing','Expected lookup time in a well-distributed hash table is what?','With controlled load and good hashing, expected lookup is constant time.','A','O(1)','O(log n)','O(n)','O(n squared)'),
('20000000-0000-0000-0000-000000000002',24,'DSA','MEDIUM','Searching','What prerequisite does standard binary search require?','Binary search relies on sorted order to discard half the range.','D','Distinct values only','Prime length','A linked list','Sorted data'),
('20000000-0000-0000-0000-000000000002',25,'DSA','HARD','Sorting','Which sort guarantees O(n log n) worst-case time and is comparison based?','Merge sort guarantees O(n log n) time across cases.','B','Bubble sort','Merge sort','Insertion sort','Selection sort'),
('20000000-0000-0000-0000-000000000002',26,'DSA','MEDIUM','Complexity','Two nested loops each run n times. What is the time complexity?','The inner body executes n multiplied by n times.','C','O(n)','O(log n)','O(n squared)','O(2n)'),
('20000000-0000-0000-0000-000000000002',27,'DEBUGGING','MEDIUM','Java Debugging','A HashMap lookup fails after a key field used by hashCode is mutated. Why?','The key may now hash to a different bucket than where it was stored.','A','Its bucket location no longer matches','Maps prohibit objects','The compiler removes the key','The map became a queue'),
('20000000-0000-0000-0000-000000000002',28,'DEBUGGING','HARD','Code Output','What prints: String a="hi"; String b=new String("hi"); System.out.print(a==b);','new String creates a distinct object, so reference equality is false.','D','hi','true','Compilation error','false'),
('20000000-0000-0000-0000-000000000002',29,'CS_FUNDAMENTALS','MEDIUM','Computer Networks','Which HTTP property allows a request to be retried without changing the intended result?','Idempotence means repeated identical requests have the same intended effect.','B','Serialization','Idempotence','Compression','Encryption'),
('20000000-0000-0000-0000-000000000002',30,'DBMS_SQL','MEDIUM','SQL','A query filters frequently on email. What should be investigated first as data grows?','An index on the selective filter column can avoid full scans.','C','More CSS','A larger HTTP body','An index on email','Removing constraints');

INSERT INTO mock_seed
SELECT '20000000-0000-0000-0000-000000000003',row_number() OVER(ORDER BY question_order),'DSA',difficulty,
CASE ((question_order-1)%12) WHEN 0 THEN 'Complexity' WHEN 1 THEN 'Arrays' WHEN 2 THEN 'Strings' WHEN 3 THEN 'Hash Maps' WHEN 4 THEN 'Linked Lists' WHEN 5 THEN 'Stack' WHEN 6 THEN 'Queue' WHEN 7 THEN 'Binary Search' WHEN 8 THEN 'Sorting' WHEN 9 THEN 'Recursion' WHEN 10 THEN 'Trees' ELSE 'Debugging' END,
CASE question_order
WHEN 1 THEN 'An algorithm halves its remaining input each step. What is its time complexity?'
WHEN 2 THEN 'Which approach finds two array values summing to a target in expected O(n) time?'
WHEN 3 THEN 'Which technique tests whether a string is a palindrome using O(1) extra space?'
WHEN 4 THEN 'What data structure best counts frequencies during a single pass?'
WHEN 5 THEN 'What is the O(1) way to insert at the head of a singly linked list?'
WHEN 6 THEN 'Which structure is used to validate balanced parentheses?'
WHEN 7 THEN 'Which structure supports first-come, first-served task processing?'
WHEN 8 THEN 'Binary search has low=0 and high=8. What is the first midpoint using integer division?'
WHEN 9 THEN 'Which stable algorithm guarantees O(n log n) worst-case sorting?'
WHEN 10 THEN 'What must every terminating recursive solution include?'
WHEN 11 THEN 'Which traversal of a binary search tree produces sorted keys?'
WHEN 12 THEN 'A loop accesses a[i+1] while i can equal length-1. What bug occurs?'
WHEN 13 THEN 'What is the space complexity of an array containing n integers?'
WHEN 14 THEN 'Which method reverses an array in place with constant extra space?'
WHEN 15 THEN 'How can the first non-repeating character be found efficiently?'
WHEN 16 THEN 'What is expected lookup complexity in a well-sized hash map?'
WHEN 17 THEN 'Which linked-list technique detects a cycle without extra storage?'
WHEN 18 THEN 'Depth-first traversal is implemented iteratively with which structure?'
WHEN 19 THEN 'A queue is implemented with two stacks. What is amortized dequeue complexity?'
WHEN 20 THEN 'Which condition prevents binary search from looping forever?'
WHEN 21 THEN 'Which sort is usually efficient for a small, nearly sorted array?'
WHEN 22 THEN 'Naive recursive Fibonacci has approximately which time complexity?'
WHEN 23 THEN 'What is the maximum number of nodes at level k of a binary tree, with root at level 0?'
WHEN 24 THEN 'A function returns before processing the final element. Which boundary is most suspect?'
WHEN 25 THEN 'Which complexity grows fastest as n increases?'
WHEN 26 THEN 'To move all zeroes to the end while preserving other order, which technique is suitable?'
WHEN 27 THEN 'Which operation efficiently builds a reversed string from many characters in Java?'
WHEN 28 THEN 'Why can a poor hash function degrade lookup to O(n)?'
WHEN 29 THEN 'What is deletion complexity when only a pointer to a non-tail singly linked node is given?'
ELSE 'Which tree traversal visits nodes level by level?' END,
CASE question_order
WHEN 1 THEN 'Repeated halving takes logarithmically many steps.' WHEN 2 THEN 'Store seen values in a hash map and check each complement.' WHEN 3 THEN 'Compare characters with inward-moving pointers.' WHEN 4 THEN 'A hash map associates each value with its count.' WHEN 5 THEN 'Point the new node to the old head, then replace head.' WHEN 6 THEN 'A stack matches each closing delimiter to the latest opening delimiter.' WHEN 7 THEN 'A queue provides FIFO ordering.' WHEN 8 THEN '(0+8)/2 is 4.' WHEN 9 THEN 'Merge sort is stable and O(n log n) in the worst case.' WHEN 10 THEN 'A base case stops recursive calls.' WHEN 11 THEN 'In-order traversal visits BST keys in sorted order.' WHEN 12 THEN 'The final access is beyond the valid array index.' WHEN 13 THEN 'Storage grows linearly with the number of elements.' WHEN 14 THEN 'Swap symmetric elements using two pointers.' WHEN 15 THEN 'Count characters, then scan again for count one.' WHEN 16 THEN 'Good distribution gives expected constant-time lookup.' WHEN 17 THEN 'Fast and slow pointers meet when a cycle exists.' WHEN 18 THEN 'An explicit stack mirrors recursive DFS.' WHEN 19 THEN 'Each item moves between stacks a constant number of times, giving amortized O(1).' WHEN 20 THEN 'The bounds must move past the midpoint on every iteration.' WHEN 21 THEN 'Insertion sort performs well on small nearly sorted inputs.' WHEN 22 THEN 'The repeated subproblems produce exponential growth.' WHEN 23 THEN 'A binary tree can double nodes each level, giving 2^k.' WHEN 24 THEN 'An exclusive/inclusive end condition is likely wrong.' WHEN 25 THEN 'Exponential growth eventually dominates polynomial and logarithmic growth.' WHEN 26 THEN 'A stable two-pointer compaction solves it in linear time.' WHEN 27 THEN 'StringBuilder avoids creating a new immutable String per append.' WHEN 28 THEN 'Many keys collide into one bucket and require a linear scan.' WHEN 29 THEN 'Copy the next node value and bypass it in O(1).' ELSE 'Breadth-first search uses a queue for level order.' END,
CASE question_order WHEN 1 THEN 'B' WHEN 2 THEN 'D' WHEN 3 THEN 'A' WHEN 4 THEN 'C' ELSE chr(65+((question_order-1)%4)) END,
CASE question_order WHEN 1 THEN 'O(n)' WHEN 2 THEN 'Nested loops' WHEN 3 THEN 'Two pointers' WHEN 4 THEN 'Stack' ELSE 'O(1)' END,
CASE question_order WHEN 1 THEN 'O(log n)' WHEN 2 THEN 'Sorting only' WHEN 3 THEN 'Hash map only' WHEN 4 THEN 'Queue' ELSE 'O(log n)' END,
CASE question_order WHEN 1 THEN 'O(n log n)' WHEN 2 THEN 'Binary tree' WHEN 3 THEN 'Recursion only' WHEN 4 THEN 'Hash map' ELSE 'O(n)' END,
CASE question_order WHEN 1 THEN 'O(n squared)' WHEN 2 THEN 'Hash map complements' WHEN 3 THEN 'Database join' WHEN 4 THEN 'Linked list' ELSE 'O(n squared)' END
FROM mock_seed WHERE assessment_id='20000000-0000-0000-0000-000000000002';

-- Scenario-generated banks use the concise explanation as the one defensible answer;
-- distractors remain explicitly distinct and incorrect rather than ambiguous.
UPDATE mock_seed SET
 option_a=CASE WHEN correct_key='A' THEN explanation ELSE 'This choice does not satisfy the stated requirement.' END,
 option_b=CASE WHEN correct_key='B' THEN explanation ELSE 'This choice uses the wrong data structure or protocol.' END,
 option_c=CASE WHEN correct_key='C' THEN explanation ELSE 'This choice has the wrong complexity or behavior.' END,
 option_d=CASE WHEN correct_key='D' THEN explanation ELSE 'This choice does not solve the scenario safely.' END
WHERE assessment_id IN('20000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000004');

INSERT INTO mock_seed
SELECT '20000000-0000-0000-0000-000000000004',row_number() OVER(ORDER BY question_order),'BACKEND',difficulty,
CASE ((question_order-1)%10) WHEN 0 THEN 'Java' WHEN 1 THEN 'Spring Boot' WHEN 2 THEN 'REST APIs' WHEN 3 THEN 'HTTP' WHEN 4 THEN 'SQL PostgreSQL' WHEN 5 THEN 'Transactions' WHEN 6 THEN 'Git' WHEN 7 THEN 'Docker' WHEN 8 THEN 'Microservices' ELSE 'Debugging' END,
CASE question_order
WHEN 1 THEN 'Which Java feature allows one interface reference to hold different implementation objects?'
WHEN 2 THEN 'A Spring controller needs validated JSON input. Which combination is appropriate?'
WHEN 3 THEN 'An API successfully creates a resource. Which status is most appropriate?'
WHEN 4 THEN 'Which HTTP method is normally idempotent for a complete resource replacement?'
WHEN 5 THEN 'A large table is slow when filtering by a selective email column. What should be checked first?'
WHEN 6 THEN 'An order and its payment record must either both persist or neither persist. Which property is required?'
WHEN 7 THEN 'Which Git command creates a new branch and switches to it in one step?'
WHEN 8 THEN 'What does a Docker image represent?'
WHEN 9 THEN 'When is a microservice boundary most appropriate?'
WHEN 10 THEN 'An endpoint returns 500 with no useful context. What is the safest first debugging step?'
WHEN 11 THEN 'Why should mutable fields generally not be used in Java hash keys?'
WHEN 12 THEN 'Which Spring annotation declares a transactional service operation?'
WHEN 13 THEN 'A client sends malformed JSON. Which response status is appropriate?'
WHEN 14 THEN 'Which HTTP status indicates authentication is required or invalid?'
WHEN 15 THEN 'Which SQL construct combines related rows by a key?'
WHEN 16 THEN 'What does database rollback do?'
WHEN 17 THEN 'Before merging, which Git operation safely records local work as a new revision?'
WHEN 18 THEN 'Why should application data be stored in a Docker volume?'
WHEN 19 THEN 'What is a key cost of synchronous microservice chains?'
WHEN 20 THEN 'A NullPointerException occurs intermittently. What evidence is most useful first?'
WHEN 21 THEN 'Which Java collection is appropriate for unique unordered identifiers?'
WHEN 22 THEN 'How does constructor injection improve a Spring service?'
WHEN 23 THEN 'Which REST response header normally identifies a newly created resource?'
WHEN 24 THEN 'A successful DELETE returns no body. Which status is suitable?'
WHEN 25 THEN 'Which PostgreSQL command displays a query execution plan?'
WHEN 26 THEN 'Which isolation anomaly reads another transaction uncommitted data?'
WHEN 27 THEN 'What is the purpose of a pull request review?'
WHEN 28 THEN 'Why use a multi-stage Docker build?'
WHEN 29 THEN 'Which mechanism helps stop repeated calls to a failing downstream service?'
ELSE 'A deployment works locally but not in a container. What should be compared first?' END,
CASE question_order WHEN 1 THEN 'Runtime polymorphism permits this substitution.' WHEN 2 THEN '@Valid triggers constraints on an @RequestBody DTO.' WHEN 3 THEN 'HTTP 201 Created represents successful creation.' WHEN 4 THEN 'PUT is defined for idempotent replacement semantics.' WHEN 5 THEN 'A suitable index can avoid scanning every row.' WHEN 6 THEN 'Atomicity makes the combined unit all-or-nothing.' WHEN 7 THEN 'git switch -c creates and selects the branch.' WHEN 8 THEN 'An image is an immutable template used to start containers.' WHEN 9 THEN 'A focused independently deployable business capability is a good boundary.' WHEN 10 THEN 'Correlated logs and the stack trace locate the failure without exposing payloads.' WHEN 11 THEN 'Mutation can change the hash bucket and break lookup.' WHEN 12 THEN '@Transactional defines the transaction boundary.' WHEN 13 THEN 'Malformed request syntax is a 400 Bad Request.' WHEN 14 THEN '401 Unauthorized signals missing or invalid authentication.' WHEN 15 THEN 'A JOIN relates rows using its predicate.' WHEN 16 THEN 'Rollback discards uncommitted changes.' WHEN 17 THEN 'A commit records a revision without rewriting existing history.' WHEN 18 THEN 'A volume persists data beyond a container lifecycle.' WHEN 19 THEN 'Latency and failure risk compound across synchronous hops.' WHEN 20 THEN 'A timestamped stack trace and correlation ID reveal the failing path.' WHEN 21 THEN 'A Set enforces uniqueness.' WHEN 22 THEN 'Required dependencies become explicit and testable.' WHEN 23 THEN 'Location points clients to the created resource.' WHEN 24 THEN '204 No Content indicates success with no response body.' WHEN 25 THEN 'EXPLAIN shows the planned execution strategy.' WHEN 26 THEN 'A dirty read observes uncommitted data.' WHEN 27 THEN 'Review detects defects and shares context before integration.' WHEN 28 THEN 'It keeps build tools out of the smaller runtime image.' WHEN 29 THEN 'A circuit breaker opens after failures and limits calls.' ELSE 'Compare configuration, environment variables, ports, and filesystem assumptions.' END,
chr(65+((question_order+1)%4)),'Option A','Option B','Option C','Option D'
FROM mock_seed WHERE assessment_id='20000000-0000-0000-0000-000000000002';

UPDATE mock_seed SET
 option_a=CASE WHEN correct_key='A' THEN explanation ELSE 'This choice does not satisfy the stated requirement.' END,
 option_b=CASE WHEN correct_key='B' THEN explanation ELSE 'This choice uses the wrong data structure or protocol.' END,
 option_c=CASE WHEN correct_key='C' THEN explanation ELSE 'This choice has the wrong complexity or behavior.' END,
 option_d=CASE WHEN correct_key='D' THEN explanation ELSE 'This choice does not solve the scenario safely.' END
WHERE assessment_id='20000000-0000-0000-0000-000000000004';

INSERT INTO mock_seed
SELECT '20000000-0000-0000-0000-000000000005',row_number() OVER(ORDER BY assessment_id,question_order),
CASE WHEN assessment_id='20000000-0000-0000-0000-000000000001' THEN CASE WHEN selection_category='LOGICAL' OR selection_category='VERBAL' THEN 'LOGICAL' ELSE 'APTITUDE' END ELSE CASE WHEN question_order<=10 THEN 'PROGRAMMING' WHEN question_order<=14 THEN 'DBMS_SQL' WHEN question_order<=18 THEN 'CS_FUNDAMENTALS' WHEN question_order<=26 THEN 'DSA' WHEN question_order<=28 THEN 'DEBUGGING' ELSE 'BACKEND' END END,
difficulty,skill_tag,question_text,explanation,correct_key,option_a,option_b,option_c,option_d
FROM mock_seed WHERE (assessment_id='20000000-0000-0000-0000-000000000001' AND question_order<=20) OR assessment_id='20000000-0000-0000-0000-000000000002';

INSERT INTO assessment_questions(id,assessment_id,question_order,question_type,question_text,explanation,difficulty,skill_tag,selection_category,created_at)
SELECT (substr(md5(assessment_id::text||question_order),1,8)||'-'||substr(md5(assessment_id::text||question_order),9,4)||'-'||substr(md5(assessment_id::text||question_order),13,4)||'-'||substr(md5(assessment_id::text||question_order),17,4)||'-'||substr(md5(assessment_id::text||question_order),21,12))::uuid,assessment_id,question_order,'MCQ',question_text,explanation,difficulty,skill_tag,selection_category,CURRENT_TIMESTAMP FROM mock_seed;

INSERT INTO assessment_options(id,question_id,option_key,option_text,is_correct,created_at)
SELECT (substr(md5(q.id::text||o.key),1,8)||'-'||substr(md5(q.id::text||o.key),9,4)||'-'||substr(md5(q.id::text||o.key),13,4)||'-'||substr(md5(q.id::text||o.key),17,4)||'-'||substr(md5(q.id::text||o.key),21,12))::uuid,q.id,o.key,o.text,o.key=s.correct_key,CURRENT_TIMESTAMP
FROM mock_seed s JOIN assessment_questions q ON q.assessment_id=s.assessment_id AND q.question_order=s.question_order
CROSS JOIN LATERAL(VALUES('A',s.option_a),('B',s.option_b),('C',s.option_c),('D',s.option_d))o(key,text);
