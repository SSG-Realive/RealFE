import { redirect } from 'next/navigation';

interface CustomPageProps {
    searchParams?: Record<string, string | string[] | undefined>;
}

async function fetchOrders(
    page: number,
    size: number,
    sort: string
): Promise<any> {
    const url = `http://localhost:8080/api/customer/orders?page=${page}&size=${size}&sort=${sort}`;
    console.log("Fetching orders from:", url);

    const response = await fetch(url, {
        cache: "no-store",
        redirect: 'follow',
    });

    if (response.status === 401 || response.status === 403) {
        console.warn(`API 요청이 인증/인가 실패 상태 코드 ${response.status}를 반환했습니다. 로그인 페이지로 리다이렉트합니다.`);
        redirect('http://localhost:8080/oauth2/authorization/kakao');
        return;
    }

    const isKakaoLoginPageHtml = response.headers.get("content-type")?.includes("text/html") &&
        (response.url.includes("kauth.kakao.com/oauth/authorize") || response.url.includes("accounts.kakao.com/login"));

    if (isKakaoLoginPageHtml) {
        console.warn(`API 요청이 JSON이 아닌 카카오 로그인 페이지 HTML을 최종 응답으로 받았습니다. 최종 URL: ${response.url}. 로그인 페이지로 리다이렉트합니다.`);
        redirect(response.url);
        return;
    }

    if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error: ${response.status} - ${errorData}`);
        throw new Error(`주문 데이터를 불러오는 데 실패했습니다: ${response.statusText || '알 수 없는 오류'}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("API 응답이 JSON 형식이 아닙니다 (예상치 못한 응답):", textResponse);
        throw new Error("API 응답이 JSON 형식이 아닙니다.");
    }

    return response.json();
}

// 리뷰 작성 버튼 클릭 시 호출될 함수
// orderId와 deliveryStatus를 파라미터로 받습니다.
async function handleReviewButtonClick(orderId: number, deliveryStatus: string) {
    // 1. 배송 상태 확인 (리뷰는 배송 완료 후에만 작성 가능하다고 가정)
    if (deliveryStatus !== "DELIVERY_COMPLETED") {
        alert("리뷰는 배송이 완료된 후에만 작성할 수 있습니다.");
        return; // 동작 중단
    }

    try {
        // 2. 백엔드에 리뷰 작성 여부 확인 API 호출
        // sellerId는 백엔드에서 orderId를 통해 찾아냅니다.
        const checkReviewResponse = await fetch(`http://localhost:8080/api/reviews/check?orderId=${orderId}`);

        if (!checkReviewResponse.ok) {
            const errorText = await checkReviewResponse.text();
            throw new Error(`리뷰 확인 실패: ${checkReviewResponse.status} - ${errorText}`);
        }

        const { hasReview } = await checkReviewResponse.json();

        // 3. 이미 리뷰가 작성되었는지 확인
        if (hasReview) {
            alert("이미 해당 주문에 대한 리뷰를 작성하셨습니다.");
            // 경고창 후 페이지 이동을 막습니다.
        } else {
            // 4. 리뷰 작성 페이지로 이동
            // 필요하다면 리뷰 작성 페이지에서 orderId만으로 필요한 정보를 다시 조회하도록 합니다.
            window.location.href = `/customer/reviews/write?orderId=${orderId}`;
        }
    } catch (error) {
        console.error("리뷰 버튼 클릭 처리 중 오류 발생:", error);
        alert("리뷰 상태를 확인하는 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
}

// OrderStatus enum에 따른 한글 설명 매핑
const orderStatusDescriptions: Record<string, string> = {
    ORDER_RECEIVED: "주문접수",
    PAYMENT_COMPLETED: "결제완료",
    PAYMENT_CANCELED: "결제취소",
    PURCHASE_CANCELED: "구매취소",
    REFUND_COMPLETED: "환불완료",
    INIT: "초기상태",
    DELIVERY_PREPARING: "배송준비중",
    DELIVERY_IN_PROGRESS: "배송중",
    DELIVERY_COMPLETED: "배송완료",
    PURCHASE_CONFIRMED: "구매확정",
};

// OrderStatus에 따른 텍스트 색상 클래스 반환
function getOrderStatusTextColorClass(status: string): string {
    switch (status) {
        case "PAYMENT_CANCELED":
        case "PURCHASE_CANCELED":
        case "REFUND_COMPLETED":
            return "text-red-600"; // 취소/환불 관련은 빨간색
        case "PURCHASE_CONFIRMED":
            return "text-blue-600"; // 구매 확정은 파란색
        case "DELIVERY_COMPLETED":
            return "text-purple-600"; // 배송 완료는 보라색
        default:
            return "text-green-600"; // 그 외 진행 중인 상태는 초록색
    }
}


export default async function OrdersPage({ searchParams }: CustomPageProps) {
    const { page: pageParam, size: sizeParam, sort: sortParam } = searchParams || {};

    const pageFromUrl = pageParam ? Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) : 1;
    const sizeFromUrl = sizeParam ? Number(Array.isArray(sizeParam) ? sizeParam[0] : sizeParam) : 10;
    const sortFromUrl = sortParam ? String(Array.isArray(sortParam) ? sortParam[0] : sortParam) : "orderedAt,desc";

    const springPageNumber = pageFromUrl - 1;

    let ordersData: any[] = [];
    let totalElements: number = 0;
    let totalPages: number = 0;
    let error: string | null = null;

    try {
        const data = await fetchOrders(
            springPageNumber,
            sizeFromUrl,
            sortFromUrl
        );
        ordersData = data.content || [];
        totalElements = data.totalElements || 0;
        totalPages = data.totalPages || 0;
    } catch (err) {
        if (err && typeof err === 'object' && 'message' in err && (err as Error).message.includes("NEXT_REDIRECT")) {
            console.log("Next.js redirect 에러가 발생하여 페이지 전환 중단.");
        } else {
            console.error("Failed to fetch orders in OrdersPage:", err);
            error = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
            ordersData = [];
        }
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">오류: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            {/* 이미지에서 보여진 진한 파란색 헤더 배너 */}
            <div className="bg-blue-800 text-white text-center py-4 rounded-t-lg mb-6">
                <h1 className="text-2xl font-bold">구매 내역</h1>
            </div>

            {ordersData.length === 0 && (
                <p className="text-lg text-gray-700 text-center mt-8">
                    주문 내역이 없습니다. 로그인하거나 데이터를 추가해주세요.
                </p>
            )}

            {ordersData.length > 0 && (
                <>
                    <p className="text-lg text-gray-700 mb-4">
                        총 주문 건수:{" "}
                        <span className="font-semibold">{totalElements}</span>건,{" "}
                        <span className="font-semibold">{totalPages}</span> 페이지
                    </p>

                    <div className="space-y-4"> {/* 각 주문 항목을 위한 카드 컨테이너 */}
                        {ordersData.map((order: any) => {
                            const firstOrderItem = order.itemDTOs?.[0];
                            console.log('Order Status:', order.orderStatus);
                            console.log('Delivery Status:', order.deliveryStatus);
                            return (
                                <div key={order.orderId} className="border rounded-lg shadow-md p-4 bg-white">
                                    <div className="flex items-start mb-3">
                                        {/* 상품 이미지 */}
                                        <div className="w-28 h-28 flex-shrink-0 bg-gray-100 flex items-center justify-center rounded-md overflow-hidden">
                                            {firstOrderItem?.imageUrl ? (
                                                <img
                                                    src={firstOrderItem.imageUrl}
                                                    alt={firstOrderItem.productName || "Product image"}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = `https://placehold.co/112x112/aabbcc/ffffff?text=No+Image`;
                                                        e.currentTarget.onerror = null;
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-sm text-gray-500">사진</span>
                                            )}
                                        </div>

                                        {/* 상품 상세 내용 - 가로 표 형식 */}
                                        <div className="ml-4 flex-grow">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-3">
                                                {firstOrderItem?.productName}
                                                {order.itemDTOs?.length > 1 && ` 외 ${order.itemDTOs.length - 1}개`}
                                            </h3>
                                            {/* 레이블 줄 */}
                                            <div className="flex justify-between text-xs text-gray-500 font-medium mb-1">
                                                <div className="w-1/4 text-left">총 가격</div>
                                                <div className="w-1/4 text-center">주문 일시</div>
                                                <div className="w-1/4 text-center">주문 상태</div>
                                                <div className="w-1/4 text-right">배송 상태</div>
                                            </div>
                                            {/* 값 줄 */}
                                            <div className="flex justify-between text-sm text-gray-900">
                                                <div className="w-1/4 text-left">{order.totalPrice.toLocaleString()}원</div>
                                                <div className="w-1/4 text-center">
                                                    {/* orderedAt이 존재할 때만 replace 및 Date 객체 생성 */}
                                                    {order.orderedAt ? new Date(order.orderedAt.replace(' ', 'T')).toLocaleDateString() : '날짜 정보 없음'}
                                                </div>
                                                <div className="w-1/4 text-center">
                                                    {/* 주문 상태를 백엔드 enum에 따라 정확히 표시 */}
                                                    <span className={`font-semibold ${getOrderStatusTextColorClass(order.orderStatus)}`}>
                                                        {orderStatusDescriptions[order.orderStatus] || order.orderStatus}
                                                    </span>
                                                </div>
                                                <div className="w-1/4 text-right">
                                                    <span className="font-semibold">{order.deliveryStatus}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 하단 버튼들 */}
                                    <div className="flex justify-end space-x-2 border-t pt-3 mt-3">
                                        {/* 리뷰 작성 버튼 */}
                                        {order.orderStatus === "PURCHASE_CONFIRMED" && (
                                            <button
                                                className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-xs transition-colors duration-200 ${
                                                    order.deliveryStatus !== "DELIVERY_COMPLETED" ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                                disabled={order.deliveryStatus !== "DELIVERY_COMPLETED"}
                                                onClick={() => handleReviewButtonClick(order.orderId, order.deliveryStatus)}
                                            >
                                                리뷰 작성
                                            </button>
                                        )}
                                        {/* 구매 확정 버튼 */}
                                        {order.orderStatus !== "PURCHASE_CONFIRMED" && order.deliveryStatus === "DELIVERY_COMPLETED" && ( // 구매 확정 상태가 아니며 배송 완료 상태일 때 구매 확정
                                            <button
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs transition-colors duration-200"
                                                onClick={() => alert(`주문 ID ${order.orderId} 구매 확정`)}
                                            >
                                                구매확정
                                            </button>
                                        )}
                                        {/* 삭제 버튼 - 주문접수, 결제완료, 초기상태, 배송준비중일때만 보이도록 */}
                                        {(order.orderStatus === "ORDER_RECEIVED" ||
                                            order.orderStatus === "PAYMENT_COMPLETED" ||
                                            order.orderStatus === "INIT" ||
                                            order.orderStatus === "DELIVERY_PREPARING") && (
                                            <button
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-xs transition-colors duration-200"
                                                onClick={() => alert(`주문 ID ${order.orderId} 삭제`)}
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-center mt-6">
                        <nav className="block">
                            <ul className="flex pl-0 rounded list-none flex-wrap">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <li key={i}>
                                        <a
                                            href={`/customer/orders?page=${i + 1}&size=${sizeFromUrl}&sort=${sortFromUrl}`}
                                            className={`relative block py-2 px-3 leading-tight bg-white border border-gray-300 text-blue-700 mr-1 hover:bg-gray-200 ${
                                                pageFromUrl === i + 1 ? "bg-blue-500 text-white" : ""
                                            }`}
                                        >
                                            {i + 1}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </>
            )}
        </div>
    );
}