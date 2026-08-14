const SUPABASE_URL =
    "https://bwpxfmubpesasuiajyak.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_d6B8rT_x88HAqmTWbxhBeQ_mR2cKLzz";


const { createClient } = supabase;

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==============================
// 화면 요소
// ==============================

const calendar =
    document.getElementById("calendar");

const diaryImages =
    document.getElementById("diaryImages");

    const homeMemoText =
    document.getElementById(
        "homeMemoText"
    );

const defaultHomeMemo =
    "Some days,\n" +
    "the music is\n" +
    "the only thing\n" +
    "that gets me\n" +
    "through.";

function showHomeMemo(memoText) {

    if (!homeMemoText) {
        return;
    }

    homeMemoText.textContent =
        memoText || defaultHomeMemo;

    homeMemoText.classList.remove(
        "is-loading"
    );

    homeMemoText.classList.add(
        "is-ready"
    );

    homeMemoText.removeAttribute(
        "aria-busy"
    );

}

const homePlaylist =
    document.getElementById(
        "homePlaylist"
    );

const diaryContentBlocks =
    document.getElementById(
        "diaryContentBlocks"
    );
const monthList =
    document.getElementById("monthList");

const calendarYear =
    document.getElementById("calendarYear");

const calendarMonth =
    document.getElementById("calendarMonth");

const passwordModal =
    document.getElementById("passwordModal");

const modalDate =
    document.getElementById("modalDate");

const passwordInput =
    document.getElementById("passwordInput");

const passwordError =
    document.getElementById("passwordError");

const closePasswordButton =
    document.getElementById("closePassword");
const openDiaryButton =
    document.getElementById("openDiary");

const diaryModal =
    document.getElementById("diaryModal");

const closeDiaryButton =
    document.getElementById("closeDiary");

const diaryDate =
    document.getElementById("diaryDate");

const diaryTitle =
    document.getElementById("diaryTitle");

const diaryText =
    document.getElementById("diaryText");

const diaryMood =
    document.getElementById("diaryMood");

const diarySong =
    document.getElementById("diarySong");

const diaryCommentList =
    document.getElementById("diaryCommentList");

const diaryCommentCount =
    document.getElementById("diaryCommentCount");

const diaryCommentForm =
    document.getElementById("diaryCommentForm");

const commentNickname =
    document.getElementById("commentNickname");

const commentDeletePassword =
    document.getElementById("commentDeletePassword");

const commentBody =
    document.getElementById("commentBody");

const commentCharacterCount =
    document.getElementById("commentCharacterCount");

const submitDiaryCommentButton =
    document.getElementById("submitDiaryComment");

const diaryCommentMessage =
    document.getElementById("diaryCommentMessage");

// ==============================
// 월 이름
// ==============================

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];


// Supabase에서 받아온 날짜
let diaryDates = [];


// 현재 보고 있는 연도 / 월
let currentYear;
let currentMonth;

// 현재 선택한 일기 날짜
let selectedDate = null;

let openedDiaryPassword =
    "";

function getCommentClientToken() {

    const storageKey =
        "mydiary-comment-client";

    try {

        let token =
            localStorage.getItem(
                storageKey
            );

        if (!token) {

            token =
                window.crypto &&
                window.crypto.randomUUID
                    ? window.crypto.randomUUID()
                    : `${Date.now()}-${Math.random()}-${Math.random()}`;

            localStorage.setItem(
                storageKey,
                token
            );

        }

        return token;

    } catch (error) {

        return `${Date.now()}-${Math.random()}-${Math.random()}`;

    }

}

function getCommentErrorMessage(error) {

    const message =
        error && error.message
            ? error.message
            : "";

    if (
        message.includes(
            "comment_rate_limited"
        )
    ) {
        return "댓글은 15초에 한 번 작성할 수 있어요.";
    }

    if (
        message.includes(
            "invalid_comment_delete_password"
        )
    ) {
        return "삭제 비밀번호가 맞지 않아요.";
    }

    if (
        message.includes(
            "invalid_diary_password"
        )
    ) {
        return "일기를 다시 열어주세요.";
    }

    if (
        message.includes(
            "Could not find the function"
        ) ||
        message.includes(
            "schema cache"
        )
    ) {
        return "댓글 기능 설정이 아직 완료되지 않았어요.";
    }

    return "잠시 후 다시 시도해주세요.";

}

function formatCommentDate(dateString) {

    const date =
        new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString(
        "ko-KR",
        {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}

function createCommentDeleteForm(comment) {

    const form =
        document.createElement("form");

    form.className =
        "comment-delete-form";

    form.hidden =
        true;

    const input =
        document.createElement("input");

    input.type =
        "password";

    input.minLength =
        4;

    input.maxLength =
        30;

    input.placeholder =
        "삭제 비밀번호";

    input.autocomplete =
        "current-password";

    input.required =
        true;

    input.setAttribute(
        "aria-label",
        "댓글 삭제 비밀번호"
    );

    const confirmButton =
        document.createElement("button");

    confirmButton.type =
        "submit";

    confirmButton.textContent =
        "삭제 확인";

    const cancelButton =
        document.createElement("button");

    cancelButton.type =
        "button";

    cancelButton.textContent =
        "취소";

    const message =
        document.createElement("span");

    message.className =
        "comment-delete-message";

    cancelButton.addEventListener(
        "click",
        function() {
            form.hidden = true;
            input.value = "";
            message.textContent = "";
        }
    );

    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            confirmButton.disabled =
                true;

            message.textContent =
                "삭제 중...";

            const {
                error
            } = await supabaseClient.rpc(
                "delete_diary_comment",
                {
                    comment_id:
                        comment.comment_id,
                    requested_date:
                        selectedDate,
                    supplied_password:
                        openedDiaryPassword,
                    comment_delete_password:
                        input.value
                }
            );

            confirmButton.disabled =
                false;

            if (error) {
                message.textContent =
                    getCommentErrorMessage(
                        error
                    );
                return;
            }

            await loadDiaryComments();

        }
    );

    form.appendChild(input);
    form.appendChild(confirmButton);
    form.appendChild(cancelButton);
    form.appendChild(message);

    return form;

}

function renderDiaryComments(comments) {

    diaryCommentList.innerHTML =
        "";

    diaryCommentCount.textContent =
        String(comments.length);

    if (comments.length === 0) {

        const empty =
            document.createElement("p");

        empty.className =
            "diary-comment-empty";

        empty.textContent =
            "아직 댓글이 없어요. 첫 메시지를 남겨주세요 ♡";

        diaryCommentList.appendChild(
            empty
        );

        return;

    }

    comments.forEach(
        function(comment) {

            const item =
                document.createElement(
                    "article"
                );

            item.className =
                "diary-comment-item";

            const header =
                document.createElement(
                    "div"
                );

            header.className =
                "diary-comment-meta";

            const nickname =
                document.createElement(
                    "strong"
                );

            nickname.textContent =
                comment.nickname;

            const time =
                document.createElement(
                    "time"
                );

            time.dateTime =
                comment.created_at;

            time.textContent =
                formatCommentDate(
                    comment.created_at
                );

            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.type =
                "button";

            deleteButton.className =
                "diary-comment-delete-toggle";

            deleteButton.textContent =
                "삭제";

            header.appendChild(nickname);
            header.appendChild(time);
            header.appendChild(
                deleteButton
            );

            const body =
                document.createElement("p");

            body.textContent =
                comment.body;

            const deleteForm =
                createCommentDeleteForm(
                    comment
                );

            deleteButton.addEventListener(
                "click",
                function() {

                    deleteForm.hidden =
                        !deleteForm.hidden;

                    if (!deleteForm.hidden) {
                        deleteForm
                            .querySelector("input")
                            .focus();
                    }

                }
            );

            item.appendChild(header);
            item.appendChild(body);
            item.appendChild(deleteForm);

            diaryCommentList.appendChild(
                item
            );

        }
    );

}

async function loadDiaryComments() {

    if (
        !selectedDate ||
        !openedDiaryPassword
    ) {
        return;
    }

    diaryCommentList.textContent =
        "댓글을 불러오는 중...";

    const {
        data,
        error
    } = await supabaseClient.rpc(
        "get_diary_comments",
        {
            requested_date:
                selectedDate,
            supplied_password:
                openedDiaryPassword
        }
    );

    if (error) {

        console.error(
            "댓글 불러오기 오류:",
            error
        );

        diaryCommentList.textContent =
            getCommentErrorMessage(
                error
            );

        diaryCommentCount.textContent =
            "0";

        return;

    }

    renderDiaryComments(
        Array.isArray(data)
            ? data
            : []
    );

}

function resetDiaryComments() {

    openedDiaryPassword =
        "";

    diaryCommentList.innerHTML =
        "";

    diaryCommentCount.textContent =
        "0";

    commentBody.value =
        "";

    commentDeletePassword.value =
        "";

    commentCharacterCount.textContent =
        "0 / 500";

    diaryCommentMessage.textContent =
        "";

}

commentBody.addEventListener(
    "input",
    function() {

        commentCharacterCount.textContent =
            `${commentBody.value.length} / 500`;

    }
);

diaryCommentForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const nickname =
            commentNickname.value.trim();

        const body =
            commentBody.value.trim();

        const deletePassword =
            commentDeletePassword.value;

        if (
            nickname.length === 0 ||
            body.length === 0 ||
            deletePassword.length < 4
        ) {
            diaryCommentMessage.textContent =
                "닉네임, 댓글, 삭제 비밀번호를 확인해주세요.";
            return;
        }

        submitDiaryCommentButton.disabled =
            true;

        submitDiaryCommentButton.textContent =
            "등록 중...";

        diaryCommentMessage.textContent =
            "";

        const {
            error
        } = await supabaseClient.rpc(
            "create_diary_comment",
            {
                requested_date:
                    selectedDate,
                supplied_password:
                    openedDiaryPassword,
                comment_nickname:
                    nickname,
                comment_body:
                    body,
                comment_delete_password:
                    deletePassword,
                client_token:
                    getCommentClientToken()
            }
        );

        submitDiaryCommentButton.disabled =
            false;

        submitDiaryCommentButton.textContent =
            "댓글 남기기";

        if (error) {

            console.error(
                "댓글 등록 오류:",
                error
            );

            diaryCommentMessage.textContent =
                getCommentErrorMessage(
                    error
                );

            return;

        }

        try {
            localStorage.setItem(
                "mydiary-comment-nickname",
                nickname
            );
        } catch (storageError) {
            // 저장이 막힌 브라우저에서는 닉네임 기억을 생략합니다.
        }

        commentBody.value =
            "";

        commentDeletePassword.value =
            "";

        commentCharacterCount.textContent =
            "0 / 500";

        diaryCommentMessage.textContent =
            "댓글이 등록되었어요 ♡";

        await loadDiaryComments();

    }
);

try {
    commentNickname.value =
        localStorage.getItem(
            "mydiary-comment-nickname"
        ) || "";
} catch (storageError) {
    // 저장이 막힌 브라우저에서는 닉네임 기억을 생략합니다.
}

// ==============================
// 일기 날짜 가져오기
// ==============================

async function loadDiaryDates() {

    const {
        data,
        error
    } = await supabaseClient
        .rpc("get_diary_dates");


    if (error) {

        console.error(
            "일기 날짜 불러오기 실패:",
            error
        );

        return;
    }


    diaryDates =
        data.map(function(item) {
            return item.entry_date;
        });


    if (diaryDates.length === 0) {

        calendarMonth.textContent =
            "No Diary";

        return;
    }


    createMonthList();


    // 가장 최근 일기가 있는 달을 처음 보여주기
    const latestDate =
        diaryDates[diaryDates.length - 1];

    const parts =
        latestDate.split("-");

    currentYear =
        Number(parts[0]);

    currentMonth =
        Number(parts[1]) - 1;


    renderCalendar(
        currentYear,
        currentMonth
    );

}

// ==============================
// 홈 화면 설정 불러오기
// ==============================

async function loadHomeSettings() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("site_settings")
            .select(
                "memo_text, playlist"
            )
            .eq(
                "id",
                1
            )
            .single();


    if (error) {

        console.error(
            "홈 화면 설정 불러오기 오류:",
            error
        );

        showHomeMemo(
            defaultHomeMemo
        );

        return;
    }


    // ==============================
    // 상단 메모
    // ==============================

    showHomeMemo(
        data.memo_text
    );


    // ==============================
    // 플레이리스트
    // ==============================

    if (!homePlaylist) {
        return;
    }


    homePlaylist.innerHTML = "";


    const playlist =
        Array.isArray(
            data.playlist
        )
            ? data.playlist
            : [];


    playlist.forEach(
        function(song, index) {

            const songElement =
                document.createElement(
                    "div"
                );

            songElement.className =
                "song";


            const number =
                document.createElement(
                    "span"
                );

            number.textContent =
                String(index + 1)
                    .padStart(
                        2,
                        "0"
                    );


            const title =
                document.createElement(
                    "strong"
                );

            title.textContent =
                song.title || "";


            const artist =
                document.createElement(
                    "em"
                );

            artist.textContent =
                song.artist
                    ? `— ${song.artist}`
                    : "";


            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.textContent =
                "▷";


            if (song.youtube) {

                button.addEventListener(
                    "click",
                    function() {

                        window.open(
                            song.youtube,
                            "_blank",
                            "noopener,noreferrer"
                        );

                    }
                );

            } else {

                button.disabled =
                    true;

            }


            songElement.appendChild(
                number
            );

            songElement.appendChild(
                title
            );

            songElement.appendChild(
                artist
            );

            songElement.appendChild(
                button
            );


            homePlaylist.appendChild(
                songElement
            );

        }
    );

}

// ==============================
// 일기가 있는 월 목록 만들기
// ==============================

function createMonthList() {

    monthList.innerHTML = "";


    const months = new Set();


    diaryDates.forEach(function(date) {

        const parts =
            date.split("-");

        const year =
            Number(parts[0]);

        const month =
            Number(parts[1]) - 1;


        months.add(
            `${year}-${month}`
        );

    });


    Array.from(months)
        .sort()
        .forEach(function(value) {

            const [
                year,
                month
            ] =
                value
                    .split("-")
                    .map(Number);


            const button =
                document.createElement("button");

            button.className =
                "month";


            button.innerHTML = `
                <span>${year}</span>
                <strong>
                    ${month + 1}월
                </strong>
            `;


            button.addEventListener(
                "click",
                function() {

                    currentYear =
                        year;

                    currentMonth =
                        month;

                    renderCalendar(
                        year,
                        month
                    );

                    updateActiveMonth(
                        year,
                        month
                    );

                }
            );


            button.dataset.year =
                year;

            button.dataset.month =
                month;


            monthList.appendChild(
                button
            );

        });

}


// ==============================
// 선택된 월 표시
// ==============================

function updateActiveMonth(
    year,
    month
) {

    const buttons =
        document.querySelectorAll(
            ".month"
        );


    buttons.forEach(function(button) {

        button.classList.remove(
            "active"
        );


        if (
            Number(button.dataset.year)
                === year
            &&
            Number(button.dataset.month)
                === month
        ) {

            button.classList.add(
                "active"
            );

        }

    });

}


// ==============================
// 달력 만들기
// ==============================

function renderCalendar(
    year,
    month
) {

    // 요일 제목을 제외한 날짜칸 삭제
    const existingDays =
        calendar.querySelectorAll(
            ".day, .empty-day"
        );


    existingDays.forEach(function(item) {
        item.remove();
    });


    calendarYear.textContent =
        `──── ${year} ────`;

    calendarMonth.textContent =
        monthNames[month];


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const lastDate =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    // 첫 주 빈칸
    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-day";

        calendar.appendChild(
            empty
        );

    }


    // 실제 날짜
    for (
        let day = 1;
        day <= lastDate;
        day++
    ) {

        const button =
            document.createElement("button");

        button.className =
            "day";

        button.textContent =
            day;


        const monthText =
            String(month + 1)
                .padStart(2, "0");

        const dayText =
            String(day)
                .padStart(2, "0");


        const dateString =
            `${year}-${monthText}-${dayText}`;


        const hasDiary =
            diaryDates.includes(
                dateString
            );


if (hasDiary) {

    button.classList.add(
        "memory"
    );

    button.addEventListener(
        "click",
        function() {

            openPasswordModal(
                dateString
            );

        }
    );

} else {

    button.classList.add(
        "no-memory"
    );

}


        calendar.appendChild(
            button
        );

    }


    updateActiveMonth(
        year,
        month
    );

}


// ==============================
// 비밀번호 화면 열기
// ==============================

function openPasswordModal(dateString) {

    const safeDateString =
        String(dateString);

    selectedDate =
        safeDateString;

    modalDate.textContent =
        safeDateString.replaceAll(
            "-",
            " · "
        );

    passwordInput.value =
        "";

    passwordError.classList.remove(
        "show"
    );

    passwordModal.classList.add(
        "show"
    );

    setTimeout(function() {

        passwordInput.focus();

    }, 100);

}

// ==============================
// 비밀번호 확인 후 일기 열기
// ==============================

openDiaryButton.addEventListener(
    "click",
    async function() {

        const password =
            passwordInput.value;

        if (!selectedDate || password.length === 0) {
            return;
        }


        openDiaryButton.disabled = true;

        openDiaryButton.textContent =
            "OPENING...";


        const {
            data,
            error
        } = await supabaseClient.rpc(
            "unlock_diary",
            {
                requested_date:
                    selectedDate,

                supplied_password:
                    password
            }
        );


        openDiaryButton.disabled = false;

        openDiaryButton.textContent =
            "OPEN";


        if (error) {

            console.error(
                "일기 열기 오류:",
                error
            );

            passwordError.textContent =
                "일기를 불러오지 못했어요.";

            passwordError.classList.add(
                "show"
            );

            return;
        }


        if (!data || data.length === 0) {

            passwordError.textContent =
                "비밀번호가 맞지 않아요 ♡";

            passwordError.classList.add(
                "show"
            );

            return;
        }


        const diary =
            data[0];
diaryImages.innerHTML = "";

console.log("사진 함수 호출 시작");

const {
    data: imageResult,
    error: imageFunctionError
} =
    await supabaseClient.functions.invoke(
        "get-diary-images",
        {
            body: {
                requested_date:
                    selectedDate,

                supplied_password:
                    password
            }
        }
    );

console.log(
    "사진 함수 결과:",
    imageResult
);

console.log(
    "사진 함수 오류:",
    imageFunctionError
);

if (imageFunctionError) {

    console.error(
        "사진 불러오기 실패:",
        imageFunctionError
    );

} else if (
    imageResult &&
    imageResult.images
) {

    imageResult.images.forEach(
        function(imageUrl) {

            const img =
                document.createElement(
                    "img"
                );

            img.src = imageUrl;

            img.loading = "lazy";

            img.className =
                "diary-image";

            diaryImages.appendChild(
                img
            );

        }
    );

}
// ==============================
// 콘텐츠 블록 표시
// ==============================

diaryContentBlocks.innerHTML = "";

if (
    imageResult &&
    Array.isArray(
        imageResult.content_blocks
    )
) {

    imageResult.content_blocks.forEach(
        function(block) {

            // 글 블록
            if (block.type === "text") {

                const text =
                    document.createElement(
                        "div"
                    );

                text.className =
                    "diary-block-text";

                text.textContent =
                    block.content || "";

                diaryContentBlocks
                    .appendChild(text);

            }


            // 사진 블록
            if (
                block.type === "image" &&
                block.url
            ) {

                const img =
                    document.createElement(
                        "img"
                    );

                img.src =
                    block.url;

                img.loading =
                    "lazy";

                img.className =
                    "diary-block-image";

                diaryContentBlocks
                    .appendChild(img);

            }

        }
    );

}
const hasContentBlocks =
    imageResult &&
    Array.isArray(
        imageResult.content_blocks
    ) &&
    imageResult.content_blocks.length > 0;

        passwordModal.classList.remove(
            "show"
        );


        diaryDate.textContent =
            diary.entry_date.replaceAll(
                "-",
                " · "
            );


        diaryTitle.textContent =
            diary.title || "";


 // ==============================
// 모든 일기 콘텐츠 함께 표시
// ==============================

// 기존 본문
diaryText.textContent =
    diary.content || "";

if (diary.content) {

    diaryText.style.display =
        "block";

} else {

    diaryText.style.display =
        "none";

}


// 새 글/사진 블록
if (hasContentBlocks) {

    diaryContentBlocks.style.display =
        "block";

} else {

    diaryContentBlocks.style.display =
        "none";

}


// 기존 일반 첨부사진
if (
    imageResult &&
    Array.isArray(
        imageResult.images
    ) &&
    imageResult.images.length > 0
) {

    diaryImages.style.display =
        "grid";

} else {

    diaryImages.style.display =
        "none";

}


diaryMood.textContent =
    diary.mood || "♡";


diarySong.textContent =
    diary.song || "♪";


diaryModal.classList.add(
    "show"
);

openedDiaryPassword =
    password;

loadDiaryComments();

    }
);
// Enter 키로도 OPEN

passwordInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            openDiaryButton.click();

        }

    }
);
// ==============================
// 창 닫기
// ==============================

closePasswordButton.addEventListener(
    "click",
    function() {

        passwordModal.classList.remove(
            "show"
        );

    }
);
// 일기 창 닫기

closeDiaryButton.addEventListener(
    "click",
    function() {

        diaryModal.classList.remove(
            "show"
        );

        resetDiaryComments();

    }
);


diaryModal.addEventListener(
    "click",
    function(event) {

        if (event.target === diaryModal) {

            diaryModal.classList.remove(
                "show"
            );

            resetDiaryComments();

        }

    }
);

passwordModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target
            === passwordModal
        ) {

            passwordModal.classList.remove(
                "show"
            );

        }

    }
);


// ==============================
// 시작
// ==============================

loadDiaryDates();
loadHomeSettings();
