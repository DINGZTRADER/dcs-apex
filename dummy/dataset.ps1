import json
import csv
import random
from datetime import datetime, timedelta

# Configuration
NUM_EXPENSES = 1000
START_DATE = datetime(2025, 1, 1)
END_DATE = datetime(2025, 12, 31)

# Departments
departments = [
    "Faculty of Science",
    "Faculty of Engineering",
    "Faculty of Business",
    "Faculty of Humanities",
    "Faculty of Law",
    "Faculty of Medicine",
    "ICT Services",
    "Human Resources",
    "Finance Department",
    "Facilities Management",
    "Library Services",
    "Student Affairs"
]

# Payment statuses
statuses = ["Paid", "Pending", "Invoiced"]

# Category logic with realistic UGX ranges
category_config = {
    "salaries": {
        "departments": [d for d in departments if "Faculty" in d or d in ["Human Resources", "Finance Department"]],
        "min_amount": 1800000,
        "max_amount": 18000000,
        "weight": 45  # 45% of expenses
    },
    "utilities": {
        "departments": ["Facilities Management"],
        "min_amount": 2000000,
        "max_amount": 15000000,
        "weight": 15
    },
    "maintenance": {
        "departments": ["Facilities Management"],
        "min_amount": 1000000,
        "max_amount": 30000000,
        "weight": 15
    },
    "academic_supplies": {
        "departments": [d for d in departments if "Faculty" in d or d == "Library Services"],
        "min_amount": 500000,
        "max_amount": 5000000,
        "weight": 15
    },
    "other": {
        "departments": departments,
        "min_amount": 200000,
        "max_amount": 10000000,
        "weight": 10
    }
}

# Build category list based on weights
categories = []
for cat, cfg in category_config.items():
    categories.extend([cat] * cfg["weight"])

expenses = []
for i in range(NUM_EXPENSES):
    category = random.choice(categories)
    cfg = category_config[category]
    
    amount = random.randint(cfg["min_amount"], cfg["max_amount"])
    dept = random.choice(cfg["departments"])
    status = random.choices(statuses, weights=[70, 20, 10])[0]  # Mostly 'Paid'
    
    # Random date in 2025
    delta = END_DATE - START_DATE
    rand_days = random.randint(0, delta.days)
    date = (START_DATE + timedelta(days=rand_days)).strftime("%Y-%m-%d")
    
    expenses.append({
        "expense_id": f"EXP{i+1:04d}",
        "category": category,
        "amount_ugx": amount,
        "date": date,
        "department": dept,
        "payment_status": status
    })

# Save as JSON
with open("apex_university_expenses.json", "w") as f:
    json.dump(expenses, f, indent=2)

# Save as CSV
with open("apex_university_expenses.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=expenses[0].keys())
    writer.writeheader()
    writer.writerows(expenses)

print("? Generated apex_university_expenses.json and .csv with 1,000 entries!")