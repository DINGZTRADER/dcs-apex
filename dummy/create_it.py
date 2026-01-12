import json
import random
from datetime import datetime, timedelta

# Ugandan first & last names
first_names_female = ["Nakato", "Prossy", "Annet", "Gladys", "Sarah", "Mary", "Judith", "Patience", "Rebecca", "Esther", 
                      "Namagembe", "Nalweyiso", "Nabaggala", "Nakabugo", "Nalubega", "Nakimuli", "Nakawunde", "Nakazibwe"]
first_names_male = ["Okello", "Mugisha", "Kato", "Ssebunya", "Mbabazi", "Nsamba", "Tumwine", "Wasswa", "Ssentongo", "Bbosa",
                    "Ssekitto", "Nsubuga", "Lwanga", "Kyambadde", "Mukasa", "Ssebatta", "Nakibuuka", "Ssempijja"]
last_names = ["Mugisha", "Nakato", "Okello", "Namagembe", "Kato", "Ssebunya", "Mbabazi", "Nsamba", "Tumwine", "Wasswa",
              "Ssentongo", "Bbosa", "Ssekitto", "Nsubuga", "Lwanga", "Kyambadde", "Mukasa", "Ssebatta", "Nakibuuka", "Ssempijja",
              "Ahebwa", "Byamugisha", "Kabonesa", "Nabukenya", "Turyasiima"]

programs = [
    "Bachelor of Science in Computer Science",
    "Bachelor of Arts in Education",
    "Bachelor of Medicine and Surgery",
    "Bachelor of Business Administration",
    "Bachelor of Laws",
    "Bachelor of Engineering (Civil)",
    "Bachelor of Agricultural Economics",
    "Bachelor of Environmental Health",
    "Bachelor of Nursing Science",
    "Diploma in Information Technology"
]

departments = [
    "Faculty of Computing & Informatics",
    "Faculty of Education",
    "Faculty of Medicine",
    "Faculty of Business & Management",
    "Faculty of Law",
    "Faculty of Engineering",
    "Faculty of Agriculture",
    "Faculty of Public Health",
    "Faculty of Social Sciences",
    "University Library",
    "Finance Office",
    "Registry",
    "ICT Department",
    "Maintenance Unit"
]

expense_categories = ["Office Supplies", "Utilities", "Salaries", "Maintenance", "Travel", "Research Grants", "Training", "Security", "Cleaning", "Internet Services"]
expense_statuses = ["PENDING", "APPROVED", "REJECTED", "PAID"]

def random_date(start_year=1970, end_year=2005):
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    delta = end - start
    random_days = random.randint(0, delta.days)
    return (start + timedelta(days=random_days)).strftime("%Y-%m-%dT00:00:00.000Z")

def random_start_date():
    start = datetime(2010, 1, 1)
    end = datetime(2025, 12, 31)
    delta = end - start
    random_days = random.randint(0, delta.days)
    return (start + timedelta(days=random_days)).strftime("%Y-%m-%dT00:00:00.000Z")

# Build data list
data = []

# 1 Director
data.append({
    "model": "User",
    "data": {
        "email": "director@uguniversity.ac.ug",
        "password": "hashedpassword123",
        "role": "DIRECTOR",
        "isActive": True
    }
})

# 1000 Students
for i in range(1, 1001):
    gender = random.choice(['F', 'M'])
    if gender == 'F':
        first = random.choice(first_names_female)
    else:
        first = random.choice(first_names_male)
    last = random.choice(last_names)
    full_name = f"{first} {last}"
    student_no = f"S{i:03d}"
    program = random.choice(programs)
    year = random.randint(1, min(4, programs.index(program) + 1))  # Adjust max year by program
    data.append({
        "model": "Student",
        "data": {
            "studentNo": student_no,
            "fullName": full_name,
            "program": program,
            "year": year,
            "status": "ACTIVE"
        }
    })

# 300 Teachers (LECTURER)
for _ in range(300):
    first = random.choice(first_names_male + first_names_female)
    last = random.choice(last_names)
    full_name = f"Dr. {first} {last}" if random.random() > 0.3 else f"{first} {last}"
    dept = random.choice(departments[:9])  # Academic depts only
    salary = random.randint(4000000, 7000000)
    dob = random_date(1970, 1990)
    start_date = random_start_date()
    data.append({
        "model": "Staff",
        "data": {
            "fullName": full_name,
            "role": "LECTURER",
            "department": dept,
            "salary": salary,
            "dob": dob,
            "startDate": start_date,
            "status": "ACTIVE"
        }
    })

# 300 Non-Teaching Staff
non_teaching_roles = ["ADMIN", "CLEANER", "SECURITY", "OTHER"]
for _ in range(300):
    first = random.choice(first_names_female + first_names_male)
    last = random.choice(last_names)
    full_name = f"{first} {last}"
    role = random.choice(non_teaching_roles)
    dept = random.choice(departments)
    salary = random.randint(1800000, 3500000)
    dob = random_date(1975, 1995)
    start_date = random_start_date()
    data.append({
        "model": "Staff",
        "data": {
            "fullName": full_name,
            "role": role,
            "department": dept,
            "salary": salary,
            "dob": dob,
            "startDate": start_date,
            "status": "ACTIVE"
        }
    })

# 300 Expenses
for _ in range(300):
    cat = random.choice(expense_categories)
    desc = f"{cat} expense for {random.choice(departments).lower()} - {random.choice(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])} 2025"
    amount = random.randint(50000, 10000000)
    status = random.choice(expense_statuses)
    data.append({
        "model": "Expense",
        "data": {
            "category": cat,
            "description": desc,
            "amount": amount,
            "status": status
        }
    })

# Write to file
with open("seed_data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("? Generated seed_data.json with 1 user, 1000 students, 600 staff (300 teachers + 300 staff), and 300 expenses.")