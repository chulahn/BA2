// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

// Pyth Entropy Solidity interfaces
import "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";

/// @title RandomBackground
/// @notice Example Pyth Entropy consumer that assigns a random UI color index per user.
/// @dev This contract is designed to mirror the pattern used in the Pyth
///      coin_flip example, but instead of deciding win/lose it derives a
///      color index from the random number.
contract RandomBackground is IEntropyConsumer {
    /// @notice Entropy contract (global Pyth Entropy entrypoint on this chain)
    IEntropy private entropy;

    /// @notice Provider address (the randomness provider registered with Entropy)
    address public provider;

    /// @notice Number of color slots; your frontend should use the same constant.
    uint8 public constant NUM_COLORS = 5;

    /// @dev sequenceNumber -> user that requested randomness
    mapping(uint64 => address) public sequenceToUser;

    /// @notice Last raw random value per user (for debugging / advanced use)
    mapping(address => bytes32) public lastRandomRaw;

    /// @notice Last derived color index per user (0 .. NUM_COLORS-1)
    mapping(address => uint8) public lastColorIndex;

    event BackgroundRequested(address indexed user, uint64 indexed sequenceNumber);
    event BackgroundAssigned(
        address indexed user,
        uint64 indexed sequenceNumber,
        bytes32 randomNumber,
        uint8 colorIndex
    );

    /// @param entropyAddress Pyth Entropy contract address on this chain
    /// @param providerAddress Default/randomness provider address
    constructor(address entropyAddress, address providerAddress) {
        entropy = IEntropy(entropyAddress);
        provider = providerAddress;
    }

    // =========================
    // IEntropyConsumer plumbing
    // =========================

    /// @dev Called by IEntropyConsumer._entropyCallback to check the Entropy contract.
    ///      Must return the same address you passed in the constructor.
    function getEntropy() internal view override returns (address) {
        return address(entropy);
    }

    /// @dev Called by Entropy (via _entropyCallback) once a random number is ready.
    ///      Here we map the random number to a color index and store it per user.
    function entropyCallback(
        uint64 sequenceNumber,
        address callbackProvider,
        bytes32 randomNumber
    ) internal override {
        // Sanity check: make sure this callback is for the expected provider
        require(callbackProvider == provider, "RandomBackground: unexpected provider");

        address user = sequenceToUser[sequenceNumber];
        require(user != address(0), "RandomBackground: unknown sequence");

        // Store the raw random bytes for debugging/inspection
        lastRandomRaw[user] = randomNumber;

        // Derive a small color index from the random value
        uint256 randomAsUint = uint256(randomNumber);
        uint8 colorIndex = uint8(randomAsUint % NUM_COLORS);

        lastColorIndex[user] = colorIndex;

        emit BackgroundAssigned(user, sequenceNumber, randomNumber, colorIndex);

        // Clean up to avoid unbounded storage growth
        delete sequenceToUser[sequenceNumber];
    }

    // =========================
    // Public API
    // =========================

    /// @notice Request a new random background color.
    /// @param userRandomNumber A user-provided secret random value (bytes32).
    ///        This should be generated off-chain (e.g. in your backend or frontend).
    ///        It is used by Entropy's commit-reveal scheme; do NOT reuse it.
    /// @return sequenceNumber Entropy sequence number for this request.
    function requestRandomBackground(
        bytes32 userRandomNumber
    ) external payable returns (uint64 sequenceNumber) {
        // Ask Entropy what fee we must pay this provider
        uint128 fee = entropy.getFee(provider);
        require(msg.value >= fee, "RandomBackground: insufficient fee for Entropy");

        // Request randomness with callback.
        // Entropy will later call `_entropyCallback` -> `entropyCallback`.
        sequenceNumber = entropy.requestWithCallback{value: fee}(provider, userRandomNumber);

        // Remember who initiated this sequence so we can assign the result later.
        sequenceToUser[sequenceNumber] = msg.sender;

        emit BackgroundRequested(msg.sender, sequenceNumber);
    }
}
