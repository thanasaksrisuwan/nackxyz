# 🏗️ สถาปัตยกรรมระบบ Serverless: Laravel Portfolio Lab (Always Free)

เอกสารนี้อธิบายถึงสถาปัตยกรรมและการทำงานของระบบ **Laravel-Portfolio-Lab** ในรูปแบบ **Serverless** บน AWS เพื่อให้ระบบสามารถทำงานได้ภายใต้โควตา **"Always Free"** ของ AWS (ไม่มีค่าใช้จ่ายตลอดชีพ หากไม่ใช้งานเกินโควตาฟรีที่กำหนด)

---

## 🗺️ แผนผังภาพรวมระบบ (System Architecture)

```mermaid
graph TD
    User([ผู้ใช้งาน / Visitors]) -->|HTTP Request| APIGateway[AWS API Gateway]
    APIGateway -->|Route Request| Lambda[AWS Lambda: php-83-fpm]
    
    subgraph AWS Lambda (Stateless)
        Laravel[Laravel App]
        Laravel -->|Read Database| DB[Database Options]
    end
    
    Laravel -->|Upload Screenshots| S3[AWS S3 Bucket]
    Admin([ผู้ดูแลระบบ]) -->|Manage Projects| Lambda
    
    classDef aws fill:#ff9900,stroke:#333,stroke-width:2px,color:#fff;
    class APIGateway,Lambda,S3 aws;
```

---

## ⚙️ ส่วนประกอบของสถาปัตยกรรม (Architecture Components)

### 1. ⚡ Compute (ประมวลผล)
*   **บริการที่ใช้:** **AWS Lambda** + **Amazon API Gateway** (ควบคุมและ Deploy ผ่านเฟรมเวิร์ก **Bref**)
*   **รันไทม์ (Runtime):** PHP 8.3 (Custom Runtime layer ของ Bref: `php-83-fpm` สำหรับเว็บ และ `php-83-console` สำหรับคอมมานด์ไลน์)
*   **โควตา Always Free:**
    *   **AWS Lambda:** ฟรี 1,000,000 Requests และ 400,000 GB-seconds ของเวลาประมวลผลต่อเดือน **ตลอดชีพ**
    *   **API Gateway:** ฟรี 1,000,000 API Calls ต่อเดือน **ตลอดชีพ** (สำหรับ HTTP APIs)

### 2. 🗄️ ตัวเลือกฐานข้อมูล (Database Options)
เนื่องจากระบบประมวลผลเป็น Serverless (Stateless) การจัดการฐานข้อมูลจึงสามารถเลือกทำได้ 3 รูปแบบตามความเหมาะสม:

#### ทางเลือกที่ 1: SQLite ใน `/tmp` (แนะนำสำหรับเว็บ Portfolio ส่วนตัว)
*   **การทำงาน:** นำไฟล์ฐานข้อมูล SQLite (`database.sqlite`) ใส่ไว้ในโปรเจกต์ ตอนที่ Lambda ทำงานจะดึงข้อมูลแบบ Read-only จาก codebase โดยตรง หรือคัดลอกไปที่ `/tmp/database.sqlite` เพื่อให้เขียน/อ่านได้ชั่วคราว
*   **ข้อดี:** ฟรี 100% ตลอดชีพ ไม่ต้องติดตั้งเซิร์ฟเวอร์ฐานข้อมูลเพิ่มเติม และรวดเร็วมาก
*   **ข้อจำกัด:** ข้อมูลจะถูกรีเซ็ตกลับเป็นค่าเริ่มต้นเมื่อ Lambda ถุกเคลียร์ (Cold Start หรือเมื่อมีการอัปเดตโค้ดใหม่) เหมาะสำหรับข้อมูลโปรเจกต์ที่อัปเดตผ่าน Seeder และใช้เก็บข้อความติดต่อชั่วคราวหรือส่งเข้าเมลทันที

#### ทางเลือกที่ 2: Amazon DynamoDB (Always Free 25GB)
*   **การทำงาน:** เชื่อมต่อ Laravel เข้ากับ DynamoDB (NoSQL) ผ่าน Laravel DynamoDB Provider
*   **โควตา Always Free:** ฟรีพื้นที่เก็บข้อมูล **25 GB** และโควตา Read/Write throughput (25 WCU / 25 RCU) **ตลอดชีพ** ซึ่งเพียงพอสำหรับระบบ Portfolio ขนาดเล็กถึงกลาง
*   **ข้อดี:** ฟรีตลอดชีพอย่างแท้จริง ข้อมูลไม่สูญหายเหมือน SQLite ใน `/tmp`

#### ทางเลือกที่ 3: Amazon RDS MySQL (Free 12 เดือนแรก)
*   **การทำงาน:** เชื่อมต่อผ่าน RDS MySQL (Single-DB Instance) ตามสเปก `db.t3.micro` หรือ `db.t4g.micro`
*   **ข้อดี:** รองรับการเขียน/อ่านแบบ Relational Database เต็มรูปแบบตามมาตรฐาน Laravel
*   **ข้อจำกัด:** ฟรีเฉพาะ **12 เดือนแรก** หลังจากเปิดบัญชีใหม่เท่านั้น

---

## 📦 การจัดการ Queue และ Cache แบบ Serverless

เนื่องจากการรันบน AWS Lambda ไม่จำเป็นต้องติดตั้ง Redis Server แยกเพื่อลดค่าใช้จ่ายและภาระการดูแลระบบ จึงปรับเปลี่ยนดังนี้:
*   **Queue (ระบบคิวส่งเมล):** กำหนดเป็น `sync` ในไฟล์ `serverless.yml` เพื่อให้ประมวลผลส่งเมลทันทีใน Request เดียวกัน หรือส่งข้อมูลไปยัง **Amazon SQS** (ซึ่งมีโควตา Always Free 1,000,000 ข้อความต่อเดือน)
*   **Cache:** กำหนดเป็น `array` หรือใช้ `database` เพื่อไม่ให้เกิดความขัดแย้งของข้อมูลระหว่าง Lambda container ที่รันแยกส่วนกัน
*   **Session:** กำหนดเป็น `cookie` เพื่อให้เก็บข้อมูลเซสชันไว้ฝั่งผู้ใช้งาน แทนการเขียนลงไฟล์ในเซิร์ฟเวอร์

---

## 🚀 ระบบ CI/CD อัตโนมัติ (GitHub Actions)

เมื่อใดก็ตามที่มีการ `git push` โค้ดไปยังกิ่ง `main` ระบบจะรันไฟล์ทำงานอัตโนมัติที่ [.github/workflows/deploy.yml](file:///C:/Users/Nack/aws-lab/mcp-lab/.github/workflows/deploy.yml) โดยมีขั้นตอนดังนี้:
1.  ดึงโค้ดเวอร์ชันล่าสุดจาก GitHub
2.  ติดตั้ง PHP 8.3 และติดตั้ง Composer dependencies สำหรับการใช้งานบนโปรดักชัน (`--no-dev --optimize-autoloader`)
3.  ติดตั้ง Node.js และ Serverless Framework
4.  ตั้งค่า AWS Credentials จาก GitHub Secrets (`AWS_ACCESS_KEY_ID` และ `AWS_SECRET_ACCESS_KEY`)
5.  สั่งรัน `serverless deploy --stage production` เพื่ออัปโหลดโค้ดขึ้น AWS Lambda และตั้งค่า API Gateway ให้โดยอัตโนมัติ

---

## 🔑 ขั้นตอนการตั้งค่าบน AWS Console & GitHub (3 ขั้นตอนสั้นๆ)

สำหรับการ Deploy ระบบ Serverless คุณไม่จำเป็นต้องกดสร้าง Lambda, API Gateway หรือจัดการ Server ด้วยตัวเอง ระบบ Serverless Framework จะทำการสร้างทุกอย่างให้อัตโนมัติ โดยดำเนินการตามขั้นตอนด้านล่างนี้:

### ขั้นตอนที่ 1: สร้าง IAM User (สำหรับสิทธิ์การ Deploy)
1. ค้นหาคำว่า **IAM** ในช่องค้นหาของ AWS Console
2. ไปที่เมนู **Users** (ด้านซ้าย) -> คลิกปุ่ม **Create user**
3. ตั้งชื่อ User (เช่น `github-deployer` หรือ `mcp-lab-user`) แล้วกด **Next**
4. ในหน้า Permissions ให้เลือก **"Attach policies directly"**
5. ค้นหาและทำเครื่องหมายเลือก **`AdministratorAccess`** (เพื่อให้ Serverless Framework มีสิทธิ์สร้างบริการต่างๆ ได้สมบูรณ์)
6. กด **Next** และคลิก **Create user**

### ขั้นตอนที่ 2: สร้าง Access Key สำหรับใช้งานใน Script
1. คลิกเข้าไปที่ชื่อ User ที่เพิ่งสร้างเสร็จ
2. ไปที่แท็บ **Security credentials**
3. เลื่อนลงมาที่หัวข้อ **Access keys** แล้วคลิก **Create access key**
4. เลือกตัวเลือก **Command Line Interface (CLI)**
5. กดยอมรับเงื่อนไข แล้วกด **Next** -> **Create access key**
6. ⚠️ **สำคัญมาก:** หน้าจอจะแสดง **Access key ID** และ **Secret access key** ให้คัดลอกเก็บไว้ทันที (หากปิดหน้าจอนี้ไปจะไม่สามารถดู Secret ได้อีก)

### ขั้นตอนที่ 3: นำ Key ไปบันทึกใน GitHub (GitHub Secrets)
1. ไปที่หน้า Repository ของคุณบน GitHub
2. ไปที่เมนู **Settings** -> **Secrets and variables** -> **Actions**
3. คลิก **New repository secret**
4. ทำการเพิ่มค่าความลับสองตัวนี้:
   - **Name:** `AWS_ACCESS_KEY_ID` (ใส่ค่า Access key ID ที่ได้มาจาก AWS)
   - **Name:** `AWS_SECRET_ACCESS_KEY` (ใส่ค่า Secret access key ที่ได้มาจาก AWS)

หลังจากดำเนินการตั้งค่าคีย์เรียบร้อยแล้ว ทุกๆ ครั้งที่มีการ Push โค้ดขึ้นสาขา `main` ระบบจะทำการ Deploy โค้ดและปรับโครงสร้าง Infrastructure บน AWS Lambda ให้คุณแบบอัตโนมัติทันที!

