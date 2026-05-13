import json
import qrcode
import os

# Ayarlar
INFO_JSON = "fishes_info.json"
IMAGE_DIR = r"assets\images\fish_image"
QR_DIR = r"assets\qrcodes"
FINAL_JSON = "final_database.json"

# QR klasörü yoksa oluştur
if not os.path.exists(QR_DIR):
    os.makedirs(QR_DIR)

# 1. Bilgileri yükle
with open(INFO_JSON, 'r', encoding='utf-8') as f:
    fish_data = json.load(f)

final_list = []

# 2. Eşleştirme ve QR Üretimi
for fish in fish_data:
    fish_id = fish['id']
    
    # QR Üret (İçine sadece ID yazıyoruz ki uygulama bunu okuyunca veriyi bulsun)
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(fish_id)
    qr.make(fit=True)
    
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_file_name = f"qr_{fish_id}.png"
    qr_img.save(os.path.join(QR_DIR, qr_file_name))
    
    # Bilgileri birleştir (Mapping)
    fish['image_path'] = os.path.join(IMAGE_DIR, f"{fish_id}.png") # Resim adının ID ile aynı olduğunu varsayar
    fish['qr_path'] = os.path.join(QR_DIR, qr_file_name)
    
    final_list.append(fish)

# 3. Final Veri Tabanını Kaydet
with open(FINAL_JSON, 'w', encoding='utf-8') as f:
    json.dump(final_list, f, ensure_ascii=False, indent=4)

print(f"Eşleştirme tamamlandı! {FINAL_JSON} dosyası ve QR kodlar hazır.")