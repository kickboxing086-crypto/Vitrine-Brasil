/**
 * Utility to generate a valid Brazilian Pix static copy-and-paste payload (BR Code)
 * and calculate the correct CRC16-CCITT checksum.
 */

function crc16ccitt(str: string): string {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    const charCode = str.charCodeAt(c);
    crc ^= (charCode << 8);
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xFFFF;
    }
  }
  const hex = crc.toString(16).toUpperCase();
  return hex.padStart(4, '0');
}

export function generateStaticPix({
  key,
  amount,
  name = "Impulsione Link",
  city = "Natal",
  description = ""
}: {
  key: string;
  amount?: number;
  name?: string;
  city?: string;
  description?: string;
}): string {
  const cleanKey = key.trim();
  
  // Normalize string (remove accents and special chars)
  const normalize = (text: string) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9 ]/g, "");
  };

  const cleanName = normalize(name).substring(0, 25) || "Impulsione Link";
  const cleanCity = normalize(city).substring(0, 15) || "Natal";

  const parts: string[] = [];

  // 00: Payload Format Indicator
  parts.push("000201");
  // 01: Point of Initiation Method (11 = static/reusable, 12 = dynamic)
  parts.push("010211");

  // 26: Merchant Account Information
  const gui = "br.gov.bcb.pix";
  let merchantAccountInfo = "";
  merchantAccountInfo += "00" + gui.length.toString().padStart(2, "0") + gui;
  merchantAccountInfo += "01" + cleanKey.length.toString().padStart(2, "0") + cleanKey;
  
  if (description) {
    const cleanDesc = normalize(description).substring(0, 25);
    if (cleanDesc) {
      merchantAccountInfo += "02" + cleanDesc.length.toString().padStart(2, "0") + cleanDesc;
    }
  }
  
  parts.push("26" + merchantAccountInfo.length.toString().padStart(2, "0") + merchantAccountInfo);

  // 52: Merchant Category Code
  parts.push("52040000");
  
  // 53: Currency (986 = BRL)
  parts.push("5303986");

  // 54: Transaction Amount
  if (amount && amount > 0) {
    const amtStr = amount.toFixed(2);
    parts.push("54" + amtStr.length.toString().padStart(2, "0") + amtStr);
  }

  // 58: Country Code
  parts.push("5802BR");

  // 59: Merchant Name
  parts.push("59" + cleanName.length.toString().padStart(2, "0") + cleanName);

  // 60: Merchant City
  parts.push("60" + cleanCity.length.toString().padStart(2, "0") + cleanCity);

  // 62: Additional Data Field (Sub-05 Transaction ID/Label)
  const additionalData = "0503***";
  parts.push("62" + additionalData.length.toString().padStart(2, "0") + additionalData);

  // 63: CRC16 Checksum
  const incompletePayload = parts.join("") + "6304";
  const checksum = crc16ccitt(incompletePayload);
  return incompletePayload + checksum;
}
