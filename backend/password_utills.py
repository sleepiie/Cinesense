import bcrypt 

def hash_password(plain_password:str) -> str:
    salt = bcrypt.gensalt() # สุ่มค่าความปลอดภัย
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"),salt) # เอาค่าที่สุ่มมาเข้ารหัส string => byte
    return hashed.decode("utf-8") # แปลงผลลัพธ์แล้วเก็บลง  db byte => string


def verify_password(plain_password:str,hashed_password:str)->bool:

    # ดึง salt จากตัวหลังมา hash ให้ตัวหน้า แล้วเอาค่าที่ hash ไปเทียบกับตัวหลัง
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")   # แปลงรหัสกลับเป็น byte                
    )
