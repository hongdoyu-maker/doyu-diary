const SUPABASE_URL = "https://bwpxfmubpesasuiajyak.supabase.co";
const SUPABASE_KEY = "sb_publishable_d6B8rT_x88HAqmTWbxhBeQ_mR2cKLzz";

const { createClient } = supabase;

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("adminEmail");
const passwordInput = document.getElementById("adminPassword");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    loginMessage.textContent = "로그인 중...";
    loginMessage.className = "login-message";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {

        loginMessage.textContent =
            "로그인에 실패했어요. 이메일과 비밀번호를 확인해주세요.";

        loginMessage.className =
            "login-message error";

        console.error(error);

        return;
    }

    loginMessage.textContent =
        "로그인 성공 ♡";

    loginMessage.className =
        "login-message success";
adminLogin.style.display = "none";
adminDashboard.classList.add("show");
    console.log("로그인한 사용자:", data.user);
loadAdminDiaryList();
loadAdminComments();
    await loadHomeSettings();
});
const adminLogin =
    document.getElementById("adminLogin");

const adminDashboard =
    document.getElementById("adminDashboard");

const addTextBlockButtons =
    document.querySelectorAll("[data-add-text-block]");

const addImageBlockButtons =
    document.querySelectorAll("[data-add-image-block]");

const bottomBlockButtons =
    document.getElementById("bottomBlockButtons");

const photoSelectionToolbar =
    document.getElementById("photoSelectionToolbar");

const selectedPhotoCount =
    document.getElementById("selectedPhotoCount");

const photoMoveGuide =
    document.getElementById("photoMoveGuide");

const moveSelectedPhotosButton =
    document.getElementById("moveSelectedPhotos");

const clearPhotoSelectionButton =
    document.getElementById("clearPhotoSelection");

    const adminDiaryList =
    document.getElementById(
        "adminDiaryList"
    );

const adminCommentList =
    document.getElementById(
        "adminCommentList"
    );

const refreshAdminCommentsButton =
    document.getElementById(
        "refreshAdminComments"
    );

const contentBlockEditor =
    document.getElementById("contentBlockEditor");

let contentBlocks = [];

const selectedImageBlocks =
    new Set();

let isPhotoMoveMode =
    false;

let editingDate = null;

const imagePreview =
    document.getElementById("imagePreview");

const logoutButton =
    document.getElementById("logoutButton");

const diaryForm =
    document.getElementById("diaryForm");

    const homeMemo =
    document.getElementById("homeMemo");

const playlistEditor =
    document.getElementById("playlistEditor");

const addPlaylistSongButton =
    document.getElementById("addPlaylistSong");

const saveHomeSettingsButton =
    document.getElementById("saveHomeSettings");

const homeSettingsMessage =
    document.getElementById("homeSettingsMessage");


let playlistSongs = [];

const diarySaveMessage =
    document.getElementById("diarySaveMessage");

const supportedImageExtensions =
    new Map([
        ["image/jpeg", "jpg"],
        ["image/png", "png"],
        ["image/webp", "webp"],
        ["image/gif", "gif"]
    ]);

function getSupportedImageExtension(file) {

    const mimeExtension =
        supportedImageExtensions.get(
            String(file.type).toLowerCase()
        );

    if (mimeExtension) {
        return mimeExtension;
    }

    const extensionMatch =
        String(file.name).toLowerCase().match(
            /\.(jpe?g|png|webp|gif)$/
        );

    if (!extensionMatch) {
        return "";
    }

    return extensionMatch[1] === "jpeg"
        ? "jpg"
        : extensionMatch[1];

}

diaryForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        diarySaveMessage.textContent =
            "일기를 저장하고 있어요...";


        const entryDate =
            document.getElementById("entryDate").value;

        const entryTitle =
            document.getElementById("entryTitle").value.trim();

        const entryContent =
            document.getElementById("entryContent").value.trim();

if (!editingDate) {
            const {
    data: existingDiary,
    error: existingDiaryError
} =
    await supabaseClient
        .from("diary_entries")
        .select("entry_date")
        .eq(
            "entry_date",
            entryDate
        )
        .maybeSingle();


if (existingDiaryError) {

    console.error(
        "중복 날짜 확인 오류:",
        existingDiaryError
    );

    diarySaveMessage.textContent =
        "날짜를 확인하는 중 오류가 발생했어요.";

    return;
}


if (existingDiary) {

    diarySaveMessage.textContent =
        "이미 이 날짜에 작성한 일기가 있어요 ♡";

    return;

}
}

        const entryMood =
            document.getElementById("entryMood").value.trim();

        const entrySong =
            document.getElementById("entrySong").value.trim();

        const entryPassword =
            document.getElementById("entryPassword").value;


// ==============================
// 콘텐츠 블록 사진 업로드
// ==============================

const savedContentBlocks = [];

for (
    let i = 0;
    i < contentBlocks.length;
    i++
) {

    const block =
        contentBlocks[i];


    // 글 블록
    if (block.type === "text") {

        const text =
            (block.content || "").trim();

        // 비어 있는 글 블록은 저장하지 않음
        if (text.length > 0) {

            savedContentBlocks.push({
                type: "text",
                content: text
            });

        }

    }


   // ==============================
// 사진 블록
// ==============================

if (block.type === "image") {


    // ==============================
    // 기존에 저장되어 있던 사진
    // ==============================

    if (
        !block.file &&
        block.path
    ) {

        savedContentBlocks.push({
            type: "image",
            path: block.path
        });

        continue;

    }


    // ==============================
    // 새로 추가한 사진
    // ==============================

    if (block.file) {

        const file =
            block.file;


        const extension =
            getSupportedImageExtension(
                file
            );

        if (!extension) {
            diarySaveMessage.textContent =
                "JPG, PNG, WEBP, GIF 사진만 올릴 수 있어요.";
            return;
        }


        const fileName =
            `block-${Date.now()}-${i}.${extension}`;

        const contentType =
            extension === "jpg"
                ? "image/jpeg"
                : `image/${extension}`;


        const filePath =
            `${entryDate}/${fileName}`;


        diarySaveMessage.textContent =
            `본문 사진 업로드 중... (${i + 1}/${contentBlocks.length})`;


        const {
            data: uploadData,
            error: uploadError
        } =
            await supabaseClient.storage
                .from("diary-images")
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl: "3600",
                        contentType: contentType,
                        upsert: false
                    }
                );


        if (uploadError) {

            console.error(
                "블록 사진 업로드 오류:",
                uploadError
            );

            diarySaveMessage.textContent =
                "본문 사진 업로드에 실패했어요.";

            return;

        }


        savedContentBlocks.push({
            type: "image",
            path: uploadData.path
        });

    }

}

}
        let data;
let error;

// 저장하기 직전,
// 수정 중이었는지 기억해두기
const wasEditing =
    Boolean(editingDate);


// ==============================
// 수정 모드
// ==============================

if (editingDate) {

    const result =
        await supabaseClient
            .from("diary_entries")
            .update({
                entry_date: entryDate,
                title: entryTitle,
                content: entryContent,
                mood: entryMood,
                song: entrySong,
                entry_password: entryPassword,
                image_paths: [],
                content_blocks: savedContentBlocks
            })
            .eq(
                "entry_date",
                editingDate
            )
            .select();

    data =
        result.data;

    error =
        result.error;


// ==============================
// 새 일기 모드
// ==============================

} else {

    const result =
        await supabaseClient
            .from("diary_entries")
            .insert([
                {
                    entry_date: entryDate,
                    title: entryTitle,
                    content: entryContent,
                    mood: entryMood,
                    song: entrySong,
                    entry_password: entryPassword,
                    image_paths: [],
                    content_blocks: savedContentBlocks
                }
            ])
            .select();

    data =
        result.data;

    error =
        result.error;

}

        if (error) {

    console.error(
        "일기 저장 오류 전체:",
        error
    );

    diarySaveMessage.textContent =
        "저장 실패: " + error.message;

    return;
}


        diarySaveMessage.textContent =
    wasEditing
        ? "일기가 수정되었어요 ♡"
        : "일기가 저장되었어요 ♡";

        diaryForm.reset();
selectedImages = [];

imagePreview.innerHTML = "";

contentBlocks.forEach(
    function(block) {

        if (
            block.type === "image" &&
            block.previewUrl
        ) {

            URL.revokeObjectURL(
                block.previewUrl
            );

        }

    }
);


contentBlocks = [];

selectedImageBlocks.clear();
isPhotoMoveMode = false;
updatePhotoSelectionToolbar();

// 수정 모드 종료
editingDate = null;

contentBlockEditor.innerHTML = "";
        console.log(
            "저장된 일기:",
            data
        );
await loadAdminDiaryList();
    }
);logoutButton.addEventListener(
    "click",
    async function() {

        await supabaseClient.auth.signOut();

        adminDashboard.classList.remove("show");

        adminLogin.style.display = "flex";

        loginMessage.textContent = "";

    }
)

function updatePhotoSelectionToolbar() {

    const selectedCount =
        selectedImageBlocks.size;

    const hasSelection =
        selectedCount > 0;

    if (!hasSelection) {
        isPhotoMoveMode = false;
    }

    photoSelectionToolbar.hidden =
        !hasSelection;

    selectedPhotoCount.textContent =
        `${selectedCount}장 선택`;

    photoMoveGuide.textContent =
        isPhotoMoveMode
            ? "사진을 놓을 위치를 선택하세요."
            : "선택한 사진을 한 번에 옮길 수 있어요.";

    moveSelectedPhotosButton.textContent =
        isPhotoMoveMode
            ? "이동 취소"
            : "선택한 사진 이동";

    bottomBlockButtons.hidden =
        hasSelection;

    addTextBlockButtons.forEach(
        function(button) {
            button.disabled =
                hasSelection;
        }
    );

    addImageBlockButtons.forEach(
        function(button) {
            button.disabled =
                hasSelection;
        }
    );

}

function createPhotoMoveTarget(
    targetIndex,
    label
) {

    const button =
        document.createElement("button");

    button.type =
        "button";

    button.className =
        "photo-move-target";

    button.dataset.targetIndex =
        String(targetIndex);

    button.textContent =
        label || "여기로 이동";

    button.addEventListener(
        "click",
        function() {
            moveSelectedPhotosTo(
                targetIndex
            );
        }
    );

    return button;

}

function moveSelectedPhotosTo(
    targetIndex
) {

    const selectedBlocks =
        contentBlocks.filter(
            function(block) {
                return selectedImageBlocks
                    .has(block);
            }
        );

    if (selectedBlocks.length === 0) {
        return;
    }

    let insertionIndex = 0;

    for (
        let index = 0;
        index < targetIndex;
        index++
    ) {

        if (
            !selectedImageBlocks.has(
                contentBlocks[index]
            )
        ) {
            insertionIndex++;
        }

    }

    const remainingBlocks =
        contentBlocks.filter(
            function(block) {
                return !selectedImageBlocks
                    .has(block);
            }
        );

    contentBlocks = [
        ...remainingBlocks.slice(
            0,
            insertionIndex
        ),
        ...selectedBlocks,
        ...remainingBlocks.slice(
            insertionIndex
        )
    ];

    selectedImageBlocks.clear();
    isPhotoMoveMode = false;

    renderContentBlocks();

    const firstMovedBlock =
        contentBlockEditor.querySelector(
            `.content-block[data-index="${insertionIndex}"]`
        );

    if (firstMovedBlock) {
        firstMovedBlock.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }

}

moveSelectedPhotosButton.addEventListener(
    "click",
    function() {

        isPhotoMoveMode =
            !isPhotoMoveMode;

        renderContentBlocks();

    }
);

clearPhotoSelectionButton.addEventListener(
    "click",
    function() {

        selectedImageBlocks.clear();
        isPhotoMoveMode = false;

        renderContentBlocks();

    }
);

function renderContentBlocks() {

    contentBlockEditor.innerHTML = "";


    if (isPhotoMoveMode) {
        contentBlockEditor.appendChild(
            createPhotoMoveTarget(
                0,
                "맨 위로 이동"
            )
        );
    }


    contentBlocks.forEach(
        function(block, index) {

            if (
                isPhotoMoveMode &&
                index > 0 &&
                !selectedImageBlocks.has(
                    block
                )
            ) {
                contentBlockEditor.appendChild(
                    createPhotoMoveTarget(
                        index,
                        "여기로 이동"
                    )
                );
            }

            const blockElement =
                document.createElement("div");

            blockElement.className =
                "content-block";

            const isSelectedImage =
                block.type === "image" &&
                selectedImageBlocks.has(
                    block
                );

            blockElement.classList.toggle(
                "is-photo-selected",
                isSelectedImage
            );

blockElement.draggable =
    selectedImageBlocks.size === 0 &&
    !isPhotoMoveMode;

blockElement.dataset.index = index;

            if (block.type === "text") {

                const textarea =
                    document.createElement(
                        "textarea"
                    );

                textarea.placeholder =
                    "이 부분에 글을 적어주세요.";

                textarea.value =
                    block.content || "";

                textarea.addEventListener(
                    "input",
                    function() {

                        contentBlocks[index].content =
                            textarea.value;

                    }
                );

                blockElement.appendChild(
                    textarea
                );

            }


            if (block.type === "image") {

    const selectButton =
        document.createElement(
            "button"
        );

    selectButton.type =
        "button";

    selectButton.className =
        "photo-select-button";

    selectButton.setAttribute(
        "aria-pressed",
        String(isSelectedImage)
    );

    selectButton.textContent =
        isSelectedImage
            ? "✓ 선택됨"
            : "사진 선택";

    selectButton.disabled =
        isPhotoMoveMode;

    selectButton.addEventListener(
        "click",
        function() {

            if (
                selectedImageBlocks.has(
                    block
                )
            ) {
                selectedImageBlocks.delete(
                    block
                );
            } else {
                selectedImageBlocks.add(
                    block
                );
            }

            isPhotoMoveMode = false;

            renderContentBlocks();

        }
    );

    blockElement.appendChild(
        selectButton
    );

    const image =
        document.createElement(
            "img"
        );

    image.className =
        "block-image-preview";


    // 새로 추가한 사진
    if (block.previewUrl) {

        image.src =
            block.previewUrl;

    }


    // 기존 사진
    else if (
        block.existing &&
        block.path
    ) {

        image.alt =
            "기존 사진";

        image.style.display =
            "none";


        loadExistingBlockImage(
            block,
            image
        );

    }


    blockElement.appendChild(
        image
    );

}


            const actions =
                document.createElement("div");

            actions.className =
                "block-actions";


            const upButton =
                document.createElement(
                    "button"
                );

            upButton.type =
                "button";

            upButton.className =
                "block-action-button";

            upButton.textContent =
                "↑";


            const downButton =
                document.createElement(
                    "button"
                );

            downButton.type =
                "button";

            downButton.className =
                "block-action-button";

            downButton.textContent =
                "↓";


            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.type =
                "button";

            deleteButton.className =
                "block-action-button";

            deleteButton.textContent =
                "삭제";

            const selectionActive =
                selectedImageBlocks.size > 0;

            upButton.disabled =
                selectionActive;

            downButton.disabled =
                selectionActive;

            deleteButton.disabled =
                selectionActive;


            upButton.addEventListener(
                "click",
                function() {

                    if (index === 0) {
                        return;
                    }

                    const temp =
                        contentBlocks[index - 1];

                    contentBlocks[index - 1] =
                        contentBlocks[index];

                    contentBlocks[index] =
                        temp;

                    renderContentBlocks();

                }
            );


            downButton.addEventListener(
                "click",
                function() {

                    if (
                        index ===
                        contentBlocks.length - 1
                    ) {
                        return;
                    }

                    const temp =
                        contentBlocks[index + 1];

                    contentBlocks[index + 1] =
                        contentBlocks[index];

                    contentBlocks[index] =
                        temp;

                    renderContentBlocks();

                }
            );


            deleteButton.addEventListener(
                "click",
                function() {

                    contentBlocks.splice(
                        index,
                        1
                    );

                    renderContentBlocks();

                }
            );


            actions.appendChild(
                upButton
            );

            actions.appendChild(
                downButton
            );

            actions.appendChild(
                deleteButton
            );


            blockElement.appendChild(
                actions
            );

async function loadExistingBlockImage(
    block,
    imageElement
) {

    const {
        data,
        error
    } =
        await supabaseClient.storage
            .from(
                "diary-images"
            )
            .createSignedUrl(
                block.path,
                3600
            );


    if (error) {

        console.error(
            "기존 블록 사진 불러오기 오류:",
            error
        );

        return;

    }


    if (
        data &&
        data.signedUrl
    ) {

        imageElement.src =
            data.signedUrl;

        imageElement.style.display =
            "block";

    }

}

// ==============================
// 드래그로 순서 변경
// ==============================

blockElement.addEventListener(
    "dragstart",
    function(event) {

        event.dataTransfer.setData(
            "text/plain",
            String(index)
        );

        event.dataTransfer.effectAllowed =
            "move";

        blockElement.classList.add(
            "dragging"
        );

    }
);


blockElement.addEventListener(
    "dragend",
    function() {

        blockElement.classList.remove(
            "dragging"
        );

        document
            .querySelectorAll(
                ".content-block"
            )
            .forEach(
                function(element) {

                    element.classList.remove(
                        "drag-over"
                    );

                }
            );

    }
);


blockElement.addEventListener(
    "dragover",
    function(event) {

        event.preventDefault();

        event.dataTransfer.dropEffect =
            "move";

        blockElement.classList.add(
            "drag-over"
        );

    }
);


blockElement.addEventListener(
    "dragleave",
    function() {

        blockElement.classList.remove(
            "drag-over"
        );

    }
);


blockElement.addEventListener(
    "drop",
    function(event) {

        event.preventDefault();

        blockElement.classList.remove(
            "drag-over"
        );


        const fromIndex =
            Number(
                event.dataTransfer.getData(
                    "text/plain"
                )
            );

        const toIndex =
            index;


        if (
            Number.isNaN(fromIndex) ||
            fromIndex === toIndex
        ) {
            return;
        }


        const movedBlock =
            contentBlocks.splice(
                fromIndex,
                1
            )[0];


        contentBlocks.splice(
            toIndex,
            0,
            movedBlock
        );


        renderContentBlocks();

    }
);

            contentBlockEditor.appendChild(
                blockElement
            );

        }
    );

    if (isPhotoMoveMode) {
        contentBlockEditor.appendChild(
            createPhotoMoveTarget(
                contentBlocks.length,
                "맨 아래로 이동"
            )
        );
    }

    updatePhotoSelectionToolbar();

}

// ==============================
// 플레이리스트 편집 화면
// ==============================

function renderPlaylistEditor() {

    playlistEditor.innerHTML = "";


    playlistSongs.forEach(
        function(song, index) {

            const songBox =
                document.createElement("div");

            songBox.className =
                "playlist-edit-item";


            // 번호
            const number =
                document.createElement("span");

            number.className =
                "playlist-edit-number";

            number.textContent =
                String(index + 1)
                    .padStart(2, "0");


            // 곡 제목
            const titleInput =
                document.createElement("input");

            titleInput.type =
                "text";

            titleInput.placeholder =
                "곡 제목";

            titleInput.value =
                song.title || "";

            titleInput.addEventListener(
                "input",
                function() {

                    playlistSongs[index].title =
                        titleInput.value;

                }
            );


            // 아티스트
            const artistInput =
                document.createElement("input");

            artistInput.type =
                "text";

            artistInput.placeholder =
                "아티스트";

            artistInput.value =
                song.artist || "";

            artistInput.addEventListener(
                "input",
                function() {

                    playlistSongs[index].artist =
                        artistInput.value;

                }
            );


            // YouTube 링크
            const youtubeInput =
                document.createElement("input");

            youtubeInput.type =
                "url";

            youtubeInput.placeholder =
                "YouTube 링크";

            youtubeInput.value =
                song.youtube || "";

            youtubeInput.addEventListener(
                "input",
                function() {

                    playlistSongs[index].youtube =
                        youtubeInput.value;

                }
            );


            // 삭제 버튼
            const deleteButton =
                document.createElement("button");

            deleteButton.type =
                "button";

            deleteButton.textContent =
                "삭제";

            deleteButton.className =
                "playlist-delete-button";

            deleteButton.addEventListener(
                "click",
                function() {

                    playlistSongs.splice(
                        index,
                        1
                    );

                    renderPlaylistEditor();

                }
            );


            songBox.appendChild(number);
            songBox.appendChild(titleInput);
            songBox.appendChild(artistInput);
            songBox.appendChild(youtubeInput);
            songBox.appendChild(deleteButton);

            playlistEditor.appendChild(
                songBox
            );

        }
    );

}

// ==============================
// 홈 화면 설정 불러오기
// ==============================

async function loadHomeSettings() {

    homeSettingsMessage.textContent =
        "홈 설정을 불러오는 중...";


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
            "홈 설정 불러오기 오류:",
            error
        );

        homeSettingsMessage.textContent =
            "홈 설정을 불러오지 못했어요.";

        return;
    }


    // 메모 불러오기
    homeMemo.value =
        data.memo_text || "";


    // 플레이리스트 불러오기
    playlistSongs =
        Array.isArray(data.playlist)
            ? data.playlist
            : [];


    renderPlaylistEditor();


    homeSettingsMessage.textContent = "";

}

addPlaylistSongButton.addEventListener(
    "click",
    function() {

        playlistSongs.push({
            title: "",
            artist: "",
            youtube: ""
        });

        renderPlaylistEditor();

    }
);

// ==============================
// 홈 화면 설정 저장
// ==============================

saveHomeSettingsButton.addEventListener(
    "click",
    async function() {

        homeSettingsMessage.textContent =
            "저장하고 있어요...";

        saveHomeSettingsButton.disabled =
            true;


        const cleanedPlaylist =
            playlistSongs
                .map(function(song) {

                    return {
                        title:
                            (song.title || "").trim(),

                        artist:
                            (song.artist || "").trim(),

                        youtube:
                            (song.youtube || "").trim()
                    };

                })
                .filter(function(song) {

                    return (
                        song.title.length > 0 ||
                        song.artist.length > 0
                    );

                });


        const {
            error
        } =
            await supabaseClient
                .from("site_settings")
                .update({
                    memo_text:
                        homeMemo.value.trim(),

                    playlist:
                        cleanedPlaylist,

                    updated_at:
                        new Date().toISOString()
                })
                .eq(
                    "id",
                    1
                );


        saveHomeSettingsButton.disabled =
            false;


        if (error) {

            console.error(
                "홈 설정 저장 오류:",
                error
            );

            homeSettingsMessage.textContent =
                "저장하지 못했어요.";

            return;
        }


        playlistSongs =
            cleanedPlaylist;


        renderPlaylistEditor();


        homeSettingsMessage.textContent =
            "홈 화면 설정이 저장되었어요 ♡";

    }
);

addTextBlockButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                contentBlocks.push({
                    type: "text",
                    content: ""
                });

                renderContentBlocks();

                const newTextarea =
                    contentBlockEditor.querySelector(
                        ".content-block:last-child textarea"
                    );

                if (newTextarea) {
                    newTextarea.focus({
                        preventScroll: true
                    });

                    newTextarea.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest"
                    });
                }

            }
        );

    }
);
addImageBlockButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const input =
                    document.createElement(
                        "input"
                    );

                input.type =
                    "file";

                input.accept =
                    "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";

                // 여러 장 선택 가능
                input.multiple =
                    true;


                input.addEventListener(
                    "change",
                    function(event) {

                        const selectedFiles =
                            Array.from(
                                event.target.files
                            );

                        const files =
                            selectedFiles.filter(
                                function(file) {
                                    return Boolean(
                                        getSupportedImageExtension(
                                            file
                                        )
                                    );
                                }
                            );


                        if (files.length === 0) {
                            diarySaveMessage.textContent =
                                "JPG, PNG, WEBP, GIF 사진만 선택해주세요.";
                            return;
                        }

                        if (
                            files.length !==
                            selectedFiles.length
                        ) {
                            diarySaveMessage.textContent =
                                "지원하지 않는 파일은 제외했어요. JPG, PNG, WEBP, GIF만 가능해요.";
                        }


                        files.forEach(
                            function(file) {

                                const previewUrl =
                                    URL.createObjectURL(
                                        file
                                    );


                                contentBlocks.push({
                                    type: "image",
                                    file: file,
                                    previewUrl:
                                        previewUrl,
                                    path: null
                                });

                            }
                        );


                        renderContentBlocks();

                        if (bottomBlockButtons) {
                            bottomBlockButtons.scrollIntoView({
                                behavior: "smooth",
                                block: "nearest"
                            });
                        }

                    }
                );


                input.click();

            }
        );

    }
);
async function loadAdminDiaryList() {

    if (!adminDiaryList) {
        return;
    }


    adminDiaryList.innerHTML =
        "불러오는 중...";


    const {
        data,
        error
    } =
        await supabaseClient
            .from("diary_entries")
            .select(
                "entry_date, title"
            )
            .order(
                "entry_date",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "관리자 일기 목록 오류:",
            error
        );

        adminDiaryList.innerHTML =
            "일기 목록을 불러오지 못했어요.";

        return;
    }


    adminDiaryList.innerHTML =
        "";


    if (
        !data ||
        data.length === 0
    ) {

        adminDiaryList.innerHTML =
            "아직 작성한 일기가 없어요.";

        return;
    }


    data.forEach(
        function(diary) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "admin-diary-item";


            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "admin-diary-info";


            const date =
                document.createElement(
                    "div"
                );

            date.className =
                "admin-diary-date";

            date.textContent =
                diary.entry_date
                    .replaceAll(
                        "-",
                        " · "
                    );


            const title =
                document.createElement(
                    "div"
                );

            title.className =
                "admin-diary-title";

            title.textContent =
                diary.title ||
                "(제목 없음)";


            info.appendChild(
                date
            );

            info.appendChild(
                title
            );


            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "admin-diary-actions";


            const editButton =
                document.createElement(
                    "button"
                );

            editButton.type =
                "button";

            editButton.className =
                "admin-diary-action-button";

            editButton.textContent =
                "수정";

                editButton.addEventListener(
    "click",
    async function() {

        const {
            data: editDiary,
            error: editDiaryError
        } =
            await supabaseClient
                .from("diary_entries")
                .select(
                    "entry_date, title, content, mood, song, image_paths, content_blocks"
                )
                .eq(
                    "entry_date",
                    diary.entry_date
                )
                .single();


        if (editDiaryError) {

            console.error(
                "수정할 일기 불러오기 오류:",
                editDiaryError
            );

            alert(
                "일기를 불러오지 못했어요."
            );

            return;

        }


        // 현재 수정 중인 날짜 기억
        editingDate =
            editDiary.entry_date;


        // 기존 내용을 작성 폼에 넣기
        document
            .getElementById(
                "entryDate"
            )
            .value =
                editDiary.entry_date;


        document
            .getElementById(
                "entryTitle"
            )
            .value =
                editDiary.title || "";


        document
            .getElementById(
                "entryContent"
            )
            .value =
                editDiary.content || "";


        document
            .getElementById(
                "entryMood"
            )
            .value =
                editDiary.mood || "";


        document
            .getElementById(
                "entrySong"
            )
            .value =
                editDiary.song || "";

                // ==============================
// 기존 콘텐츠 블록 불러오기
// ==============================

contentBlocks = [];

selectedImageBlocks.clear();
isPhotoMoveMode = false;

if (
    Array.isArray(
        editDiary.content_blocks
    )
) {

    editDiary.content_blocks.forEach(
        function(block) {

            // 기존 글 블록
            if (block.type === "text") {

                contentBlocks.push({
                    type: "text",
                    content:
                        block.content || ""
                });

            }


            // 기존 사진 블록
            if (
                block.type === "image" &&
                block.path
            ) {

                contentBlocks.push({
                    type: "image",
                    file: null,
                    previewUrl: "",
                    path:
                        block.path,
                    existing: true
                });

            }

        }
    );

}

renderContentBlocks();


        diarySaveMessage.textContent =
            "수정할 일기를 불러왔어요 ♡";


        // 작성 폼 위치로 이동
        diaryForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
);

            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.type =
                "button";

            deleteButton.className =
                "admin-diary-action-button";

            deleteButton.textContent =
                "삭제";

                deleteButton.addEventListener(
    "click",
    async function() {

        const confirmed =
            window.confirm(
                `${diary.entry_date} 일기를 정말 삭제할까요?\n사진도 함께 삭제돼요.`
            );

        if (!confirmed) {
            return;
        }


        deleteButton.disabled =
            true;

        deleteButton.textContent =
            "삭제 중...";


        // ==============================
        // 삭제할 일기 전체 데이터 가져오기
        // ==============================

        const {
            data: diaryData,
            error: diaryLoadError
        } =
            await supabaseClient
                .from("diary_entries")
                .select(
                    "entry_date, image_paths, content_blocks"
                )
                .eq(
                    "entry_date",
                    diary.entry_date
                )
                .single();


        if (diaryLoadError) {

            console.error(
                "삭제용 일기 불러오기 오류:",
                diaryLoadError
            );

            alert(
                "일기 정보를 불러오지 못했어요."
            );

            deleteButton.disabled =
                false;

            deleteButton.textContent =
                "삭제";

            return;

        }


        // ==============================
        // Storage에서 지울 사진 경로 모으기
        // ==============================

        const pathsToDelete = [];


        // 기존 일반 첨부사진
        if (
            Array.isArray(
                diaryData.image_paths
            )
        ) {

            diaryData.image_paths.forEach(
                function(path) {

                    if (path) {
                        pathsToDelete.push(
                            path
                        );
                    }

                }
            );

        }


        // 콘텐츠 블록 사진
        if (
            Array.isArray(
                diaryData.content_blocks
            )
        ) {

            diaryData.content_blocks.forEach(
                function(block) {

                    if (
                        block.type === "image" &&
                        block.path
                    ) {

                        pathsToDelete.push(
                            block.path
                        );

                    }

                }
            );

        }


        // 중복 경로 제거
        const uniquePaths =
            [...new Set(
                pathsToDelete
            )];


        // ==============================
        // Storage 사진 삭제
        // ==============================

        if (
            uniquePaths.length > 0
        ) {

            const {
                error: storageDeleteError
            } =
                await supabaseClient.storage
                    .from(
                        "diary-images"
                    )
                    .remove(
                        uniquePaths
                    );


            if (storageDeleteError) {

                console.error(
                    "사진 삭제 오류:",
                    storageDeleteError
                );

                alert(
                    "사진 삭제에 실패해서 일기 삭제를 중단했어요."
                );

                deleteButton.disabled =
                    false;

                deleteButton.textContent =
                    "삭제";

                return;

            }

        }


        // ==============================
        // DB에서 일기 삭제
        // ==============================

        const {
            error: diaryDeleteError
        } =
            await supabaseClient
                .from("diary_entries")
                .delete()
                .eq(
                    "entry_date",
                    diary.entry_date
                );


        if (diaryDeleteError) {

            console.error(
                "일기 삭제 오류:",
                diaryDeleteError
            );

            alert(
                "일기 삭제에 실패했어요."
            );

            deleteButton.disabled =
                false;

            deleteButton.textContent =
                "삭제";

            return;

        }


        alert(
            "일기가 삭제되었어요."
        );


        await loadAdminDiaryList();

    }
);


            actions.appendChild(
                editButton
            );

            actions.appendChild(
                deleteButton
            );


            item.appendChild(
                info
            );

            item.appendChild(
                actions
            );


            adminDiaryList.appendChild(
                item
            );

        }
    );

}

function formatAdminCommentDate(
    dateString
) {

    const date =
        new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString(
        "ko-KR",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}

async function loadAdminComments() {

    if (!adminCommentList) {
        return;
    }

    adminCommentList.textContent =
        "댓글을 불러오는 중...";

    refreshAdminCommentsButton.disabled =
        true;

    const {
        data,
        error
    } = await supabaseClient
        .from("diary_comments")
        .select(
            "id, diary_date, nickname, body, created_at"
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        )
        .limit(200);

    refreshAdminCommentsButton.disabled =
        false;

    if (error) {

        console.error(
            "관리자 댓글 목록 오류:",
            error
        );

        adminCommentList.textContent =
            "댓글 기능 설치 후 목록이 표시돼요.";

        return;

    }

    adminCommentList.innerHTML =
        "";

    if (
        !data ||
        data.length === 0
    ) {
        adminCommentList.textContent =
            "아직 등록된 댓글이 없어요.";
        return;
    }

    data.forEach(
        function(comment) {

            const item =
                document.createElement(
                    "article"
                );

            item.className =
                "admin-comment-item";

            const content =
                document.createElement(
                    "div"
                );

            content.className =
                "admin-comment-content";

            const meta =
                document.createElement(
                    "div"
                );

            meta.className =
                "admin-comment-meta";

            const date =
                document.createElement(
                    "strong"
                );

            date.textContent =
                comment.diary_date
                    .replaceAll(
                        "-",
                        " · "
                    );

            const nickname =
                document.createElement(
                    "span"
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
                formatAdminCommentDate(
                    comment.created_at
                );

            meta.appendChild(date);
            meta.appendChild(nickname);
            meta.appendChild(time);

            const body =
                document.createElement("p");

            body.textContent =
                comment.body;

            content.appendChild(meta);
            content.appendChild(body);

            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.type =
                "button";

            deleteButton.className =
                "admin-diary-action-button";

            deleteButton.textContent =
                "삭제";

            deleteButton.addEventListener(
                "click",
                async function() {

                    const confirmed =
                        window.confirm(
                            "이 댓글을 삭제할까요?"
                        );

                    if (!confirmed) {
                        return;
                    }

                    deleteButton.disabled =
                        true;

                    deleteButton.textContent =
                        "삭제 중...";

                    const {
                        error: deleteError
                    } = await supabaseClient
                        .from("diary_comments")
                        .delete()
                        .eq(
                            "id",
                            comment.id
                        );

                    if (deleteError) {

                        console.error(
                            "관리자 댓글 삭제 오류:",
                            deleteError
                        );

                        window.alert(
                            "댓글을 삭제하지 못했어요."
                        );

                        deleteButton.disabled =
                            false;

                        deleteButton.textContent =
                            "삭제";

                        return;

                    }

                    await loadAdminComments();

                }
            );

            item.appendChild(content);
            item.appendChild(
                deleteButton
            );

            adminCommentList.appendChild(
                item
            );

        }
    );

}

refreshAdminCommentsButton.addEventListener(
    "click",
    loadAdminComments
);
