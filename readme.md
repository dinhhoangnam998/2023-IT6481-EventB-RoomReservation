# 2023-IT6481-Kiểm chứng và Thẩm định phần mềm
## Hệ thống đăng ký phòng họp: Mô hình hoá sử dụng Event-B & Lập trình sử dụng RESTful APIs

### Cấu trúc thư mục:
- report: chứa file báo cáo học phần: mô tả bài toán và cách tiếp cận
- event-b: chứa các file định nghĩa các context và machine
- postman: chứa Postman collection để thực hiện test các apis 

### Hướng dẫn cài đặt:
1. Rodin 
- Download và Install Rodin tại: https://sourceforge.net/projects/rodin-b-sharp/
  + Lưu ý: Rodin chưa hỗ trợ trực tiếp dòng chip Apple M1 -> cài java x86_64 bằng lệnh: "arch -x86_64 brew install oracle-jdk"
- Cài các plugin: Help -> Install New Software -> Work with: 
  + Atelier B Provers - http://www.atelierb.eu/update_site/atelierb_provers
  + Camille - http://www.stups.hhu.de/camille_updates

2. Chạy web apis:
- Download & Install Nodejs
- Download dependencies: npm install
- Chạy chương trình: npm run dev

### Tài liệu tham khảo:
- Youtube: khoá học “Mini-course around Event-B and Rodin”
- Ebook: Modeling in Event-B: System and Software Engineering" - Jean-Raymond Abrial
- Paper: “An Introduction to the Event-B Modelling Method” – “Thai Son Hoang”
- Ebook: “Java Software Development with Event B: A Practical Guide“  - Nestor Catano Collazos
- Websites ...