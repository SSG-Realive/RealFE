'use client';

import React, {useCallback, useEffect, useState} from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getOrderList, deleteOrder } from '@/service/order/orderService';
import { useAuthStore } from '@/store/customer/authStore';
import { Page, Order } from '@/types/customer/order/order';

// 이 페이지를 위한 CSS 파일을 임포트합니다.
// This page imports CSS file for styling.
import './OrderListPage.css';

export default function OrderListPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { hydrated, isAuthenticated } = useAuthStore();

    const [ordersPage, setOrdersPage] = useState<Page<Order> | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // 삭제 확인 모달 관련 상태
    // State related to delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [orderToDeleteId, setOrderToDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false); // 삭제 중 로딩 상태
    // Loading state while deleting

    // 삭제 실패 모달 관련 상태 추가
    // Add state related to delete failure modal
    const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const currentPage = Number(searchParams.get('page')) || 0;
    const pageSize = 10; // 페이지 당 아이템 수 (서비스 함수와 일치)
    // Items per page (matches service function)

    // 주문 목록을 가져오는 함수
    // Function to fetch order list
    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getOrderList(currentPage, pageSize);
            setOrdersPage(data);
        } catch (err) {
            setError(err as Error);
            console.error("주문 목록 조회 실패:", err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage]);

    // 인증 상태 및 주문 목록 로드 useEffect
    // useEffect for authentication status and order list loading
    useEffect(() => {
        if (!hydrated) {
            return;
        }

        if (!isAuthenticated()) {
            setIsLoading(false);
            // router.push('/login'); // 로그인 페이지로 리다이렉트 (필요하다면 활성화)
            // Redirect to login page (activate if needed)
            return;
        }

        fetchOrders();
    }, [fetchOrders, hydrated, isAuthenticated]);

    // 페이지 변경 핸들러
    // Page change handler
    const handlePageChange = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(pageNumber));
        router.push(`${pathname}?${params.toString()}`);
    };

    // 삭제 버튼 클릭 핸들러
    // Delete button click handler
    const handleDeleteClick = (orderId: number) => {
        setOrderToDeleteId(orderId);
        setShowDeleteModal(true); // 모달 열기
        // Open modal
    };

    // 삭제 확인 핸들러
    // Delete confirmation handler
    const handleConfirmDelete = async () => {
        if (orderToDeleteId === null) return;

        setIsDeleting(true); // 삭제 중 상태 시작
        // Start deleting state
        try {
            await deleteOrder(orderToDeleteId);
            setShowDeleteModal(false); // 삭제 확인 모달 닫기
            // Close delete confirmation modal
            setOrderToDeleteId(null); // ID 초기화
            // Reset ID
            await fetchOrders(); // 주문 목록 새로고침
            // Refresh order list
            // 성공 메시지는 alert 대신 모달 등으로 대체하는 것이 더 좋습니다.
            // It's better to replace success messages with a modal instead of alert.
            // alert('주문 내역이 성공적으로 삭제되었습니다.'); // Replaced by custom modal message
            setErrorMessage('주문 내역이 성공적으로 삭제되었습니다.');
            setShowErrorModal(true); // Use the same error modal for success messages for simplicity, or create a separate success modal.
        } catch (err) {
            const msg = (err as Error).message || '알 수 없는 오류가 발생했습니다.';
            console.error("주문 삭제 실패:", err);
            setShowDeleteModal(false); // 삭제 확인 모달 닫기
            // Close delete confirmation modal
            setOrderToDeleteId(null); // ID 초기화
            // Reset ID

            // 에러 모달 표시
            // Display error modal
            setErrorMessage(`삭제 실패: ${msg}`);
            setShowErrorModal(true);
        } finally {
            setIsDeleting(false); // 삭제 중 상태 종료
            // End deleting state
        }
    };

    // 삭제 취소 핸들러
    // Delete cancellation handler
    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setOrderToDeleteId(null);
    };

    // 에러 모달 닫기 핸들러
    // Error modal close handler
    const handleErrorModalClose = () => {
        setShowErrorModal(false);
        setErrorMessage('');
    };

    // 로딩 중 스켈레톤 UI 표시
    // Display skeleton UI while loading
    if (isLoading) {
        return <OrderListSkeleton />;
    }

    // 로그인 필요 메시지 표시 (인증되지 않은 경우)
    // Display login required message (if not authenticated)
    if (hydrated && !isAuthenticated()) {
        return (
            <div className="container notice-section">
                <h2>로그인이 필요합니다</h2>
                <p>주문 내역을 확인하시려면 로그인해주세요.</p>
                <button className="button-primary" onClick={() => router.push('/login')}>로그인 페이지로 이동</button>
            </div>
        );
    }

    // 에러 발생 시 메시지 표시
    // Display message when error occurs
    if (error) {
        return (
            <div className="container error-alert">
                <strong>오류 발생</strong>
                <p>주문 목록을 불러오는 중 문제가 발생했습니다: {error.message}</p>
            </div>
        );
    }

    // 주문 내역이 없는 경우 메시지 표시
    // Display message if there are no order details
    if (!ordersPage || ordersPage.empty) {
        return <div className="container notice-section">주문 내역이 없습니다.</div>;
    }

    return (
        <div className="container order-list-page">
            <h1>주문 내역</h1>

            <div className="order-list-container">
                {ordersPage.content.map((order) => (
                    <div key={order.orderId} className="order-card">
                        <div className="order-card-header">
                            <h2 className="order-date">
                                주문일: {new Date(order.orderCreatedAt).toLocaleDateString()}
                            </h2>
                            <span className="order-status">{order.orderStatus}</span>
                        </div>
                        <div className="order-card-content">
                            {order.orderItems.map((item) => (
                                <div key={item.orderItemId} className="order-item">
                                    <div className="item-info">
                                        <p className="item-name">{item.productName}</p>
                                        <p className="item-details">
                                            {item.price.toLocaleString()}원 x {item.quantity}개
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="order-card-footer">
                            <p className="total-price">총 결제 금액: <strong>{order.totalPrice.toLocaleString()}원</strong></p>

                            {/* 두 버튼을 감싸는 새로운 div 추가 */}
                            {/* Add a new div to wrap the two buttons */}
                            <div className="order-actions">
                                <button
                                    className="button-outline button-delete"
                                    onClick={() => handleDeleteClick(order.orderId)}
                                    disabled={isDeleting && orderToDeleteId === order.orderId}
                                >
                                    {isDeleting && orderToDeleteId === order.orderId ? '삭제 중...' : '구매내역 삭제'}
                                </button>

                                <button
                                    className="button-outline"
                                    onClick={() => router.push(`/customer/orders/${order.orderId}`)}
                                >
                                    주문 상세
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pagination-container">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={ordersPage.first}
                    className="page-button"
                >
                    이전
                </button>
                {[...Array(ordersPage.totalPages).keys()].map(pageIdx => (
                    <button
                        key={pageIdx}
                        onClick={() => handlePageChange(pageIdx)}
                        className={`page-button ${currentPage === pageIdx ? 'active' : ''}`}
                    >
                        {pageIdx + 1}
                    </button>
                ))}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={ordersPage.last}
                    className="page-button"
                >
                    다음
                </button>
            </div>

            {/* 삭제 확인 모달 컴포넌트: 페이지의 최상위 레벨에 위치 */}
            {/* Delete confirmation modal component: Located at the top level of the page */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>구매내역 삭제</h2>
                        <p>정말로 이 주문 내역을 삭제하시겠습니까?</p>
                        <div className="modal-actions">
                            <button className="button-outline" onClick={handleCancelDelete} disabled={isDeleting}>
                                취소
                            </button>
                            <button
                                className="button-primary button-delete-confirm"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? '삭제 중...' : '삭제'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 삭제 실패 메시지 모달 컴포넌트: 페이지의 최상위 레벨에 위치 */}
            {/* Delete failure message modal component: Located at the top level of the page */}
            {showErrorModal && (
                <div className="modal-overlay">
                    <div className="modal-content modal-error">
                        <h2>{errorMessage.includes('성공') ? '알림' : '오류 발생'}</h2>
                        <p>{errorMessage}</p>
                        <div className="modal-actions">
                            <button className="button-primary" onClick={handleErrorModalClose}>
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// 스켈레톤 UI 컴포넌트
// Skeleton UI component
function OrderListSkeleton(): React.ReactElement {
    return (
        <div className="container order-list-page">
            <h1>주문 내역</h1>
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton-card">
                        <div className="skeleton-header">
                            <div className="skeleton-line" style={{ width: '50%', height: '24px' }}></div>
                        </div>
                        <div className="skeleton-content">
                            <div className="skeleton-line" style={{ height: '40px' }}></div>
                            <div className="skeleton-line" style={{ height: '40px' }}></div>
                        </div>
                        <div className="skeleton-footer">
                            <div className="skeleton-line" style={{ width: '30%', height: '20px' }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
