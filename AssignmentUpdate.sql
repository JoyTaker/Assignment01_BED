select * from Medications;

create table MedicationNotes (
id INT PRIMARY KEY IDENTITY(1,1),
medication_id int foreign key references Medications(id),
note_text NVARCHAR(255),
is_deleted BIT default 0
);

