import { useState } from "react";

export function FormatRupiah(props) {
  const [nilai, setNilai] = useState(props.value);
  const handleChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    let hasil = "";
    let j = 0;
    for (let i = val.length - 1; i >= 0; i--) {
      if (j == 3) {
        hasil = "." + hasil;
        j = 0;
      }
      hasil = val[i] + hasil;
      j++;
    }
    setNilai(hasil);
    props.onChange(hasil.replace(/\./g, ""));
  };
  return (
    <input
      type="text"
      value={nilai}
      onChange={handleChange}
      placeholder={props.placeholder}
      className={props.className}
    />
  );
}
