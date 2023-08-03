// import axios from 'axios';
// import React, { useEffect, useState } from 'react';

// type PopUpGenerate2fa = {
//     isOpen: boolean;
// }

// interface qrCode {
//     qrCode: string;
//     qrCodeUrl: string;
// }


// const PopUpGenerate2fa: React.FC<PopUpGenerate2fa> = ({isOpen}) => {

//     const [qrCode, setQrCode] = useState<qrCode>();
//     useEffect(() => {
//         (async () => {
//             const getQrCode = await axios.get<qrCode>('/api/2fa/generate');
//             setQrCode(getQrCode.data);
//             console.log(getQrCode.data.qrCode);
//         })();
        
//     }, []);
    

//     if (!isOpen) return null;

//     return (
//         <>
//         </>
//     );
// }

// export default PopUpGenerate2fa;